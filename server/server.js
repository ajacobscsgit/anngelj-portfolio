import "dotenv/config";
import express from "express";
import cors from "cors";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT || 4242);
const __dirname = dirname(fileURLToPath(import.meta.url));
const reviewsFilePath = join(__dirname, "reviews.json");
const publicSiteUrl = process.env.PUBLIC_SITE_URL || "http://localhost:5500";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    console.warn("Missing STRIPE_SECRET_KEY. Checkout endpoint will fail until configured.");
}

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!stripeWebhookSecret) {
    console.warn("Missing STRIPE_WEBHOOK_SECRET. Webhook verification will fail until configured.");
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Product and order endpoints will fail until configured.");
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;
const supabase = supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    })
    : null;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("CORS origin not allowed"));
    }
}));

app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));

const ensureBackendReady = ({ requireStripe = false, requireSupabase = false } = {}) => {
    if (requireStripe && !stripe) {
        return "Stripe is not configured.";
    }

    if (requireSupabase && !supabase) {
        return "Supabase is not configured.";
    }

    return null;
};

const mapProductRecord = (record) => ({
    id: String(record.id),
    title: String(record.title || "Digital Download"),
    unit_amount: Number(record.unit_amount || 0),
    currency: String(record.currency || "usd").toLowerCase(),
    active: Boolean(record.active),
    delivery_url: record.delivery_url || null,
    product_type: record.product_type || "digital"
});

const verifyCartItems = async (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Items are required.");
    }

    const requested = items
        .map((item) => ({
            id: String(item.id || "").trim(),
            quantity: Math.max(1, Number(item.quantity || 1))
        }))
        .filter((item) => item.id);

    if (requested.length === 0) {
        throw new Error("At least one valid cart item is required.");
    }

    const productIds = Array.from(new Set(requested.map((item) => item.id)));
    const { data, error } = await supabase
        .from("products")
        .select("id,title,unit_amount,currency,active,delivery_url,product_type")
        .in("id", productIds);

    if (error) {
        throw new Error(error.message || "Unable to verify products.");
    }

    const productsById = new Map((data || []).map((row) => [String(row.id), mapProductRecord(row)]));

    const verified = requested.map((item) => {
        const product = productsById.get(item.id);
        if (!product || !product.active) {
            throw new Error(`Product '${item.id}' is unavailable.`);
        }
        if (product.unit_amount <= 0) {
            throw new Error(`Product '${item.id}' has an invalid price.`);
        }

        return {
            id: product.id,
            title: product.title,
            unit_amount: product.unit_amount,
            currency: product.currency,
            quantity: item.quantity,
            delivery_url: product.delivery_url,
            product_type: product.product_type
        };
    });

    const totalAmount = verified.reduce((sum, item) => sum + (item.unit_amount * item.quantity), 0);
    return { verified, totalAmount };
};

const createPendingOrder = async ({ sessionId, items, totalAmount, currency }) => {
    const orderPayload = {
        stripe_session_id: sessionId,
        status: "pending",
        currency,
        total_amount: totalAmount
    };

    const { data: orderRows, error: orderError } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select("id")
        .limit(1);

    if (orderError || !Array.isArray(orderRows) || orderRows.length === 0) {
        throw new Error(orderError?.message || "Unable to create pending order.");
    }

    const orderId = orderRows[0].id;
    const orderItemsPayload = items.map((item) => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        unit_amount: item.unit_amount,
        line_total: item.unit_amount * item.quantity,
        delivery_status: "pending"
    }));

    const { error: orderItemsError } = await supabase
        .from("order_items")
        .insert(orderItemsPayload);

    if (orderItemsError) {
        throw new Error(orderItemsError.message || "Unable to create order items.");
    }

    return orderId;
};

const markOrderPaid = async ({ sessionId, amountTotal, currency, customerEmail }) => {
    const { data: existingRows, error: selectError } = await supabase
        .from("orders")
        .select("id,status")
        .eq("stripe_session_id", sessionId)
        .limit(1);

    if (selectError || !Array.isArray(existingRows) || existingRows.length === 0) {
        throw new Error(selectError?.message || "Order not found for webhook session.");
    }

    const orderId = existingRows[0].id;
    const { error: updateOrderError } = await supabase
        .from("orders")
        .update({
            status: "paid",
            total_amount: Number(amountTotal || 0),
            currency: String(currency || "usd").toLowerCase(),
            customer_email: customerEmail || null,
            paid_at: new Date().toISOString()
        })
        .eq("id", orderId);

    if (updateOrderError) {
        throw new Error(updateOrderError.message || "Unable to update order status.");
    }

    const { error: updateOrderItemsError } = await supabase
        .from("order_items")
        .update({
            delivery_status: "ready",
            delivered_at: new Date().toISOString()
        })
        .eq("order_id", orderId);

    if (updateOrderItemsError) {
        throw new Error(updateOrderItemsError.message || "Unable to mark digital delivery as ready.");
    }

    return orderId;
};

const ensureReviewsFile = async () => {
    try {
        await readFile(reviewsFilePath, "utf8");
    } catch (_error) {
        await writeFile(reviewsFilePath, "[]\n", "utf8");
    }
};

const readReviews = async () => {
    await ensureReviewsFile();
    try {
        const raw = await readFile(reviewsFilePath, "utf8");
        const parsed = JSON.parse(raw || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
        return [];
    }
};

const writeReviews = async (reviews) => {
    await writeFile(reviewsFilePath, `${JSON.stringify(reviews, null, 2)}\n`, "utf8");
};

app.get("/health", (_req, res) => {
    res.json({ ok: true });
});

app.get("/api/products", async (_req, res) => {
    const backendError = ensureBackendReady({ requireSupabase: true });
    if (backendError) {
        res.status(500).json({ error: backendError });
        return;
    }

    try {
        const { data, error } = await supabase
            .from("products")
            .select("id,title,description,unit_amount,currency,category,image_url,active,metadata")
            .eq("active", true)
            .order("title", { ascending: true });

        if (error) {
            throw new Error(error.message || "Unable to load products.");
        }

        res.json({ products: data || [] });
    } catch (error) {
        res.status(500).json({ error: error.message || "Unable to load products." });
    }
});

app.get("/api/reviews", async (_req, res) => {
    try {
        const reviews = await readReviews();
        res.json({ reviews });
    } catch (error) {
        res.status(500).json({ error: error.message || "Unable to load reviews." });
    }
});

app.post("/api/reviews", async (req, res) => {
    const { name, title, body, rating } = req.body || {};
    const cleanName = String(name || "").trim().slice(0, 40);
    const cleanTitle = String(title || "").trim().slice(0, 80);
    const cleanBody = String(body || "").trim().slice(0, 500);
    const cleanRating = Math.max(1, Math.min(5, Number(rating || 5)));

    if (!cleanName || !cleanTitle || !cleanBody) {
        res.status(400).json({ error: "name, title, body, and rating are required." });
        return;
    }

    try {
        const reviews = await readReviews();
        const review = {
            id: `review-${Date.now()}`,
            name: cleanName,
            title: cleanTitle,
            body: cleanBody,
            rating: cleanRating,
            createdAt: new Date().toISOString(),
            source: "user"
        };

        reviews.unshift(review);
        await writeReviews(reviews.slice(0, 500));
        res.status(201).json({ review });
    } catch (error) {
        res.status(500).json({ error: error.message || "Unable to save review." });
    }
});

app.post("/api/create-checkout-session", async (req, res) => {
    const backendError = ensureBackendReady({ requireStripe: true, requireSupabase: true });
    if (backendError) {
        res.status(500).json({ error: backendError });
        return;
    }

    const { items, successUrl, cancelUrl } = req.body || {};

    if (!successUrl || !cancelUrl) {
        res.status(400).json({ error: "successUrl and cancelUrl are required." });
        return;
    }

    try {
        const { verified, totalAmount } = await verifyCartItems(items);

        const lineItems = verified.map((item) => ({
            quantity: item.quantity,
            price_data: {
                currency: item.currency,
                product_data: {
                    name: item.title,
                    metadata: {
                        product_id: item.id,
                        product_type: item.product_type || "digital"
                    }
                },
                unit_amount: item.unit_amount
            }
        }));

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: lineItems,
            success_url: successUrl,
            cancel_url: cancelUrl,
            automatic_tax: { enabled: false },
            billing_address_collection: "auto",
            payment_method_types: ["card", "link"],
            metadata: {
                source: "anngelj-shop"
            }
        });

        const orderId = await createPendingOrder({
            sessionId: session.id,
            items: verified,
            totalAmount,
            currency: verified[0]?.currency || "usd"
        });

        res.json({ id: session.id, url: session.url, orderId });
    } catch (error) {
        res.status(500).json({ error: error.message || "Unable to create checkout session." });
    }
});

app.post("/api/stripe/webhook", async (req, res) => {
    const backendError = ensureBackendReady({ requireStripe: true, requireSupabase: true });
    if (backendError) {
        res.status(500).json({ error: backendError });
        return;
    }

    if (!stripeWebhookSecret) {
        res.status(500).json({ error: "Stripe webhook secret is not configured." });
        return;
    }

    const signature = req.headers["stripe-signature"];
    if (!signature) {
        res.status(400).json({ error: "Missing Stripe signature." });
        return;
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
    } catch (error) {
        res.status(400).json({ error: `Webhook signature verification failed: ${error.message}` });
        return;
    }

    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            await markOrderPaid({
                sessionId: session.id,
                amountTotal: session.amount_total,
                currency: session.currency,
                customerEmail: session.customer_details?.email || session.customer_email || null
            });
        }

        res.json({ received: true });
    } catch (error) {
        res.status(500).json({ error: error.message || "Webhook processing failed." });
    }
});

app.listen(port, () => {
    console.log(`Stripe checkout server running on http://localhost:${port}`);
});
