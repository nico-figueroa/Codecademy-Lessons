# E-Commerce App (Mercantile)

A full-stack academic e-commerce application with real GitHub OAuth login and
real Stripe sandbox payments. See [`Requirements.md`](./Requirements.md) for
the full specification.

## Repository layout

This is a monorepo with two independently deployable halves. Keeping them in
separate top-level folders lets each be pointed to its own **Root Directory**
when configuring a Render service, so one repo produces two services.

```
E_Commerce_App/
├── backend/   # Node.js + Express + PostgreSQL REST API (Render Web Service)
├── frontend/  # React + Vite + Tailwind storefront SPA (Render Static Site)
└── Requirements.md
```

### `backend/`

- Node.js / Express 5 REST API, PostgreSQL via `pg`.
- Real GitHub OAuth (`/auth/github`, `/auth/github/callback`), JWT-based
  sessions, real Stripe PaymentIntents + webhook handling.
- Scripts run **from inside `backend/`**: `npm install`, `npm start`,
  `npm test`, `npm run seed:dev`.
- Entry point: `backend/bin/www`. App wiring: `backend/src/app.js`.
- Env file: `backend/src/.env` (see `backend/src/.env.test` style for the
  required variable names — never commit real secrets).

### `frontend/`

- React SPA (Vite + Tailwind) that talks to the backend API over HTTPS using
  `fetch`/`axios`, stores the JWT in `localStorage`, and embeds Stripe
  Elements for checkout.
- Not yet scaffolded — see `frontend/README.md` for status.

## Render deployment (two services from one repo)

1. **Backend — Web Service**
   - Root Directory: `Full_Stack/E_Commerce_App/backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment variables: database connection, `JWT_SECRET`,
     `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`, `STRIPE_SECRET_KEY`,
     `STRIPE_WEBHOOK_SECRET`, `CORS_ORIGIN` (set to the deployed frontend URL).
2. **Frontend — Static Site**
   - Root Directory: `Full_Stack/E_Commerce_App/frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Environment variables: API base URL, GitHub OAuth client ID (public),
     Stripe publishable key.

Because each service's Root Directory is scoped to its own subfolder, Render
only rebuilds/redeploys that service when files under its folder change.
