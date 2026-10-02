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

export function fetchUsers() {
  return client
    .get("/users", { params: { includeInactive: true } })
    .then((res) => res.data);
}

export function createUser(user) {
  return client.post("/users", user).then((res) => res.data);
}

export function updateUser(userId, changes) {
  return client.put(`/users/${userId}`, changes).then((res) => res.data);
}

export function deactivateUser(userId) {
  return client.delete(`/users/${userId}`);
}

export function assignOrder(orderId, userId) {
  return client.put(`/orders/${orderId}`, { userId }).then((res) => res.data);
}

export function fetchUserLookup() {
  return client.get("/users/lookup").then((res) => res.data);
}

export function updateOrder(orderId, changes) {
  return client.put(`/orders/${orderId}`, changes).then((res) => res.data);
}

export function createManualShipment(orderId, shipment) {
  return client.post(`/orders/${orderId}/shipment`, shipment).then((res) => res.data);
}

export function updateShipment(orderId, changes) {
  return client.put(`/orders/${orderId}/shipment`, changes).then((res) => res.data);
}

export function deleteShipment(orderId) {
  return client.delete(`/orders/${orderId}/shipment`);
}
