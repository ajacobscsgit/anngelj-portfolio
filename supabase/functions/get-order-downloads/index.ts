import Stripe from "npm:stripe";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://anngelj.com",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

const DOWNLOAD_TTL_SECONDS = 60 * 60;

type JoinedOrderItem = {
  product_id: string | null;
  product_name: string | null;
  quantity: number | null;
  products:
    | {
      id: string;
      name: string;
      slug: string | null;
      storage_path: string | null;
      file_format: string | null;
      active: boolean | null;
    }
    | Array<{
      id: string;
      name: string;
      slug: string | null;
      storage_path: string | null;
      file_format: string | null;
      active: boolean | null;
    }>
    | null;
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const stripeSecretKey =
      Deno.env.get("STRIPE_SECRET_KEY")?.trim();

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL")?.trim();

    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

    if (!stripeSecretKey || !supabaseUrl || !serviceRoleKey) {
      throw new Error("Required fulfillment secrets are missing.");
    }

    const { sessionId } = await request.json();

    if (
      typeof sessionId !== "string" ||
      !sessionId.startsWith("cs_")
    ) {
      return jsonResponse(
        {
          error: "A valid Checkout Session ID is required.",
          code: "invalid_session_id",
        },
        400,
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const session =
      await stripe.checkout.sessions.retrieve(sessionId);

    if (
      session.payment_status !== "paid" ||
      session.status !== "complete"
    ) {
      return jsonResponse(
        {
          error: "This checkout session is not paid and complete.",
          code: "session_not_paid",
        },
        403,
      );
    }

    const orderId = session.metadata?.order_id;

    if (!orderId) {
      return jsonResponse(
        {
          error: "No order is attached to this session.",
          code: "missing_order_id",
        },
        400,
      );
    }

    const {
      data: order,
      error: orderError,
    } = await supabase
      .from("orders")
      .select("id, status, stripe_session_id, customer_email")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return jsonResponse(
        {
          error: "Order could not be verified.",
          code: "order_not_found",
        },
        404,
      );
    }

    if (order.stripe_session_id !== sessionId) {
      return jsonResponse(
        {
          error: "This order does not belong to the supplied checkout session.",
          code: "session_order_mismatch",
        },
        403,
      );
    }

    if (order.status !== "paid") {
      return jsonResponse(
        {
          error:
            "Payment is confirmed, but fulfillment is still processing. Refresh shortly.",
          code: "order_not_paid",
        },
        409,
      );
    }

    const {
      data: items,
      error: itemsError,
    } = await supabase
      .from("order_items")
      .select(`
        product_id,
        product_name,
        quantity,
        products (
          id,
          name,
          slug,
          storage_path,
          file_format,
          active
        )
      `)
      .eq("order_id", orderId);

    if (itemsError || !items) {
      throw new Error("Purchased products could not be loaded.");
    }

    if (items.length === 0) {
      return jsonResponse(
        {
          error: "No purchased items were found for this order.",
          code: "order_items_not_found",
        },
        404,
      );
    }

    const downloads = [];

    for (const item of items as JoinedOrderItem[]) {
      const product = Array.isArray(item.products)
        ? item.products[0]
        : item.products;

      if (
        !product ||
        !product.active ||
        !product.storage_path
      ) {
        continue;
      }

      const {
        data: signedData,
        error: signedError,
      } = await supabase.storage
        .from("product-downloads")
        .createSignedUrl(
          product.storage_path,
          DOWNLOAD_TTL_SECONDS,
          {
            download:
              `${product.slug || "download"}.${getExtension(
                product.storage_path,
              )}`,
          },
        );

      if (signedError || !signedData?.signedUrl) {
        console.error(
          "Signed URL creation failed:",
          product.id,
          signedError,
        );
        continue;
      }

      downloads.push({
        productId: product.id,
        name: product.name,
        fileFormat: product.file_format,
        quantity: item.quantity,
        url: signedData.signedUrl,
        expiresAt: new Date(
          Date.now() + DOWNLOAD_TTL_SECONDS * 1000,
        ).toISOString(),
        expiresInSeconds: DOWNLOAD_TTL_SECONDS,
      });
    }

    if (downloads.length === 0) {
      return jsonResponse(
        {
          error:
            "No downloadable files are currently attached to this order.",
          code: "downloads_not_available",
        },
        404,
      );
    }

    return jsonResponse({
      orderId: order.id,
      customerEmail:
        order.customer_email ??
        session.customer_details?.email ??
        null,
      downloads,
    });
  } catch (error) {
    console.error("Fulfillment failed:", error);

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Downloads could not be prepared.",
        code: "fulfillment_failed",
      },
      500,
    );
  }
});

function getExtension(path: string) {
  const filename = path.split("/").pop() ?? "download.zip";
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot + 1) : "zip";
}