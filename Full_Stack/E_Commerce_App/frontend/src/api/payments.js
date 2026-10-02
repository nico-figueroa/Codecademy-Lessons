import client from "./client.js";

// Creates (or reuses an in-flight) Stripe PaymentIntent for an order.
// Returns { paymentId, clientSecret, amount, currency }.
export function createPaymentIntent(orderId) {
  return client.post("/payments/intent", { orderId }).then((res) => res.data);
}

// The webhook is the sole authority for marking a payment/order as paid, so
// the frontend polls this after stripe.confirmPayment() resolves instead of
// trusting the client-side confirmation result.
export function fetchPayment(paymentId) {
  return client.get(`/payments/${paymentId}`).then((res) => res.data);
}
