import client from "./client.js";

export function fetchAllProducts() {
  return client.get("/products/admin/all").then((res) => res.data);
}

export function createProduct(product) {
  return client.post("/products", product).then((res) => res.data);
}

export function updateProduct(productId, changes) {
  return client.put(`/products/${productId}`, changes).then((res) => res.data);
}

export function deactivateProduct(productId) {
  return client.delete(`/products/${productId}`);
}

export function updateOrderStatus(orderId, status) {
  return client.put(`/orders/${orderId}`, { status }).then((res) => res.data);
}

export function createShipment(orderId) {
  return client.post(`/orders/${orderId}/shipment`).then((res) => res.data);
}
