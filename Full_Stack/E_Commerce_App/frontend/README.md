# Summit & Co. — frontend

React 19 + Vite SPA for the [E-Commerce App](../README.md). Styled with
Tailwind CSS v4 and Google Fonts (Inter + Poppins) for a production-ready
appearance.

## Setup

```
npm install
cp .env.example .env   # then fill in VITE_API_BASE_URL and VITE_STRIPE_PUBLISHABLE_KEY
npm run dev            # http://localhost:5173
```

See the [root README](../README.md) for full local-dev and Render deployment
instructions (database setup, GitHub OAuth App, Stripe keys/webhook).

## Scripts

- `npm run dev` — start the Vite dev server with HMR.
- `npm run build` — production build to `dist/`.
- `npm run preview` — preview the production build locally.
- `npm run lint` — run ESLint.

## Structure

- `src/api/` — fetch-based API client functions (auth, products, carts,
  orders, payments), all reading the base URL from `VITE_API_BASE_URL`.
- `src/context/` — `AuthContext` (JWT stored in `localStorage`, current
  user) and `CartContext`.
- `src/components/` — shared UI (nav bar, protected route wrapper, etc.).
- `src/pages/` — one component per route: Home, ProductDetail, Login,
  Register, OAuthCallback, Cart, Checkout, OrderHistory, OrderDetail,
  NotFound.
- `src/pages/CheckoutPage.jsx` — embeds Stripe's Payment Element and
  confirms payment client-side; the order's actual "paid" status is only
  ever set by the backend's Stripe webhook handler, not by this page.
