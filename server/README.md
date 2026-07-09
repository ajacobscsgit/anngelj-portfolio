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

- `STRIPE_SECRET_KEY=sk_test_...`
- Optionally set `ALLOWED_ORIGINS=http://127.0.0.1:5500,http://localhost:5500`

## 3) Run the backend

```powershell
npm run start
```

The checkout API will run at `http://localhost:4242`.

## Endpoints

- `GET /health`
- `POST /api/create-checkout-session`

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
