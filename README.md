# anngelj.com-->anngelj-portfolio


Official website of Anngel Jacobs.

## About

This website serves as my professional portfolio,
showcasing engineering projects, analytics work,
entrepreneurial ventures, research, and educational resources.

## Built With

- HTML
- CSS
- JavaScript

## Features

- Responsive design
- Professional portfolio
- Services
- Build Log
- Resume
- Contact
- Service
- Online Shop

## Testing

Testing starters are organized in `testing/`:

- Manual QA checklists in `testing/checklists/`
- Reusable form fixtures in `testing/fixtures/`
- Playwright automation templates in `testing/templates/playwright/`

## Shop System

The portfolio now includes a complete digital download shop flow:

- `shop.html`: Premium storefront with fixed header, fixed sidebar, and independently scrollable products area
- `cart.html`: Order summary, promo code input, secure payment badges, and checkout action
- `success.html`: Payment success view with order summary and download actions
- `js/shop-data.js`: Product catalog and collection metadata
- `js/shop-core.js`: Shared cart and pricing logic
- `js/shop.js`: Storefront filters, grid rendering, cart drawer, and checkout trigger
- `js/cart.js`: Cart page interactions and checkout trigger
- `js/success.js`: Success page order rendering and download actions

## Stripe Checkout Backend

A lightweight backend is included in `server/` to create Stripe Checkout Sessions.

1. `cd server`
2. `npm install`
3. Copy `.env.example` to `.env` and set `STRIPE_SECRET_KEY`
4. `npm run start`

Frontend checkout requests default to `http://localhost:4242/api/create-checkout-session`.

## Live Website

https://anngelj.com
