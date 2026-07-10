# Shop Stripe Backend

This backend creates Stripe Checkout Sessions for the digital download shop.

## 1) Install dependencies

```powershell
cd server
npm install
```

## 2) Configure environment

Copy `.env.example` to `.env` and set your Stripe secret key.

```powershell
copy .env.example .env
```

Then edit `.env`:

- `SUPABASE_URL=https://your-project.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=ey...` (server-only secret)
- `STRIPE_SECRET_KEY=sk_test_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...` (server-only secret)
- `PUBLIC_SITE_URL=https://your-site`
- Optionally set `ALLOWED_ORIGINS=http://127.0.0.1:5500,http://localhost:5500`

## 3) Run the backend

```powershell
npm run start
```

The checkout API will run at `http://localhost:4242`.

## Endpoints

- `GET /health`
- `GET /api/products`
- `POST /api/create-checkout-session`
- `GET /api/reviews`
- `POST /api/reviews`
- `POST /api/stripe/webhook`

## Secure checkout flow

- Frontend sends cart item IDs and quantities only.
- Backend verifies product names and prices from `public.products` in Supabase.
- Backend creates a Stripe Checkout Session using verified values.
- Webhook marks orders paid in `public.orders` and `public.order_items`.
- Digital delivery is enabled only after paid webhook confirmation.

Request payload:

```json
{
  "items": [
    { "id": "product-id", "title": "Product Name", "quantity": 1, "unitAmount": 1500 }
  ],
  "successUrl": "https://your-site/success.html",
  "cancelUrl": "https://your-site/cart.html"
}
```

Response payload:

```json
{
  "id": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}

```

Review payloads are stored in `reviews.json` in this folder, so the frontend can load the same review list for every visitor.
