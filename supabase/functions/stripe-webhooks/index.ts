import Stripe from "npm:stripe";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripeSecretKey =
  Deno.env.get("STRIPE_SECRET_KEY");

const webhookSecret =
  Deno.env.get("STRIPE_WEBHOOK_SECRET");

const supabaseUrl =
  Deno.env.get("SUPABASE_URL");

const serviceRoleKey =
  Deno.env.get(
    "SUPABASE_SERVICE_ROLE_KEY",
  );

if ( 
  !stripeSecretKey ||
  !webhookSecret ||
  !supabaseUrl ||
  !serviceRoleKey
) {
  throw new Error(
    "Required webhook secrets are missing.",
  );
}

const stripe = new Stripe(
  stripeSecretKey,
);

const cryptoProvider =
  Stripe.createSubtleCryptoProvider();

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

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return new Response(
      "Method not allowed",
      {
        status: 405,
      },
    );
  }

  const signature =
    request.headers.get(
      "stripe-signature",
    );

  if (!signature) {
    return new Response(
      "Missing Stripe signature",
      {
        status: 400,
      },
    );
  }

  try {
    const rawBody =
      await request.text();

    const event =
      await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        webhookSecret,
        undefined,
        cryptoProvider,
      );

    if (
      event.type ===
      "checkout.session.completed"
    ) {
      const session =
        event.data
          .object as Stripe.Checkout.Session;

      const orderId =
        session.metadata?.order_id;

      if (!orderId) {
        throw new Error(
          "The completed session has no order ID.",
        );
      }

      if (
        session.payment_status ===
        "paid"
      ) {
        const customerEmail =
          session.customer_details
            ?.email ?? null;

        const paymentIntentId =
          typeof session.payment_intent ===
          "string"
            ? session.payment_intent
            : session.payment_intent?.id ??
              null;

        const { error } =
          await supabase
            .from("orders")
            .update({
              status: "paid",
              customer_email:
                customerEmail,
              stripe_payment_intent_id:
                paymentIntentId,
              paid_at:
                new Date().toISOString(),
              updated_at:
                new Date().toISOString(),
            })
            .eq("id", orderId)
            .eq(
              "stripe_session_id",
              session.id,
            );

        if (error) {
          throw error;
        }
      }
    }

    if (
      event.type ===
      "checkout.session.expired"
    ) {
      const session =
        event.data
          .object as Stripe.Checkout.Session;

      const orderId =
        session.metadata?.order_id;

      if (orderId) {
        await supabase
          .from("orders")
          .update({
            status: "failed",
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", orderId)
          .eq("status", "pending");
      }
    }

    return new Response(
      JSON.stringify({
        received: true,
      }),
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/json",
        },
      },
    );
  } catch (error) {
    console.error(error);

    return new Response(
      error instanceof Error
        ? error.message
        : "Webhook processing failed.",
      {
        status: 400,
      },
    );
  }
});