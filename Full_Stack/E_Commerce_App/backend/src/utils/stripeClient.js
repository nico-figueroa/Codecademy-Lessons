import Stripe from "stripe";

// Exported as a real (mutable) Stripe SDK instance so that tests can stub
// individual methods directly, e.g.
// `stripeClient.paymentIntents.create = jest.fn(...)`.
//
// The Stripe constructor does not make any network calls or validate the
// key, so this is safe to construct even with a placeholder/test key.
const stripeClient = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
  {
    apiVersion: "2024-06-20",
  },
);

export default stripeClient;
