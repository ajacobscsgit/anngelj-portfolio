import "dotenv/config";
import express from "express";
import cors from "cors";
import Stripe from "stripe";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT || 4242);
const __dirname = dirname(fileURLToPath(import.meta.url));
const reviewsFilePath = join(__dirname, "reviews.json");

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    console.warn("Missing STRIPE_SECRET_KEY. Checkout endpoint will fail until configured.");
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

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

app.use(express.json({ limit: "1mb" }));

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
    if (!stripe) {
        res.status(500).json({ error: "Stripe is not configured." });
        return;
    }

    const { items, successUrl, cancelUrl } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: "Items are required." });
        return;
    }

    if (!successUrl || !cancelUrl) {
        res.status(400).json({ error: "successUrl and cancelUrl are required." });
        return;
    }

    try {
        const lineItems = items.map((item) => {
            const title = String(item.title || "Digital Download").slice(0, 120);
            const quantity = Math.max(1, Number(item.quantity || 1));
            const unitAmount = Math.max(0, Number(item.unitAmount || 0));

            return {
                quantity,
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: title
                    },
                    unit_amount: unitAmount
                }
            };
        });

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: lineItems,
            success_url: successUrl,
            cancel_url: cancelUrl,
            automatic_tax: { enabled: false },
            billing_address_collection: "auto",
            payment_method_types: ["card", "link"]
        });

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message || "Unable to create checkout session." });
    }
});

app.listen(port, () => {
    console.log(`Stripe checkout server running on http://localhost:${port}`);
});
