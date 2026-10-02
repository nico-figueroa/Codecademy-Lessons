import client from "./client.js";

// Places an order from the current cart contents. The backend snapshots the
// cart into an order (status "pending", paymentStatus "unpaid"). The cart
// itself is left untouched at this point - items are only removed once
// Stripe confirms the payment succeeded, so a declined/failed card leaves
// the customer's selections staged in their cart.
export function placeOrder() {
  return client.post("/orders").then((res) => res.data);
}

export function fetchOrders() {
  return client.get("/orders").then((res) => res.data);
}

export function fetchOrder(orderId) {
  return client.get(`/orders/${orderId}`).then((res) => res.data);
}

// Cancels an order (restocks products if it was still pending/paid).
export function cancelOrder(orderId) {
  return client.delete(`/orders/${orderId}`).then((res) => res.data);
}
