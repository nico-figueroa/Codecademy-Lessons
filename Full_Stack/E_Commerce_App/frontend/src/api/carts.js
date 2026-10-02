import client from "./client.js";

// Fetches (and auto-creates, server-side) the signed-in user's cart.
export function fetchCart() {
  return client.get("/carts/me").then((res) => res.data);
}

// Adds a product to the cart, or increments its quantity if already present.
export function addCartItem({ productId, quantity }) {
  return client
    .post("/carts/me/items", { productId, quantity })
    .then((res) => res.data);
}

// Sets an item's quantity to an absolute value.
export function updateCartItem(itemId, quantity) {
  return client
    .put(`/carts/me/items/${itemId}`, { quantity })
    .then((res) => res.data);
}

export function removeCartItem(itemId) {
  return client.delete(`/carts/me/items/${itemId}`).then((res) => res.data);
}

// Clears the entire cart.
export function clearCart() {
  return client.post("/carts/me").then((res) => res.data);
}
