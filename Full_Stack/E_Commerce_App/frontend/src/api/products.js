import client from "./client.js";

export function fetchProducts() {
  return client.get("/products").then((res) => res.data);
}

export function fetchProduct(productId) {
  return client.get(`/products/${productId}`).then((res) => res.data);
}
