import request from "supertest";
import app from "../app.js";

let customerToken;
let secondCustomerToken;
let stockedProductId;

function authHeader(token) {
  return "Bearer " + token;
}

beforeAll(async () => {
  const res = await request(app).post("/auth/login").send({
    email: "customer@example.com",
    password: "Password123!",
  });

  customerToken = res.body.accessToken;

  await request(app).post("/auth/register").send({
    email: "second-customer@example.com",
    password: "Password123!",
  });

  const secondLogin = await request(app).post("/auth/login").send({
    email: "second-customer@example.com",
    password: "Password123!",
  });

  secondCustomerToken = secondLogin.body.accessToken;

  const products = await request(app).get("/products");
  stockedProductId = products.body[0].id;

  await request(app)
    .post("/carts/me")
    .set("Authorization", authHeader(customerToken));

  await request(app)
    .post("/carts/me/items")
    .set("Authorization", authHeader(customerToken))
    .send({ productId: stockedProductId, quantity: 1 });
});

describe("Orders API", () => {
  test("Customer can place an order", async () => {
    const res = await request(app)
      .post("/orders")
      .set("Authorization", authHeader(customerToken));

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("pending");
  });

  test("Customer can list their orders", async () => {
    const res = await request(app)
      .get("/orders")
      .set("Authorization", authHeader(customerToken));

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("Customers cannot update other users' order statuses", async () => {
    const ownOrders = await request(app)
      .get("/orders")
      .set("Authorization", authHeader(customerToken));

    const res = await request(app)
      .put(`/orders/${ownOrders.body[0].id}`)
      .set("Authorization", authHeader(secondCustomerToken))
      .send({ status: "shipped" });

    expect(res.status).toBe(403);
  });

  test("Customers cannot set non-cancelled order statuses", async () => {
    const ownOrders = await request(app)
      .get("/orders")
      .set("Authorization", authHeader(customerToken));

    const res = await request(app)
      .put(`/orders/${ownOrders.body[0].id}`)
      .set("Authorization", authHeader(customerToken))
      .send({ status: "completed" });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Only admins can update this order status");
  });

  test("Cancelling an order restores reserved stock", async () => {
    const before = await request(app).get("/products");
    const productBefore = before.body.find(
      (product) => product.id === stockedProductId,
    );

    await request(app)
      .post("/carts/me")
      .set("Authorization", authHeader(customerToken));

    await request(app)
      .post("/carts/me/items")
      .set("Authorization", authHeader(customerToken))
      .send({ productId: stockedProductId, quantity: 1 });

    const placed = await request(app)
      .post("/orders")
      .set("Authorization", authHeader(customerToken));

    expect(placed.status).toBe(201);

    const afterPlace = await request(app).get("/products");
    const productAfterPlace = afterPlace.body.find(
      (product) => product.id === stockedProductId,
    );
    expect(productAfterPlace.stock).toBe(productBefore.stock - 1);

    const cancelled = await request(app)
      .delete(`/orders/${placed.body.id}`)
      .set("Authorization", authHeader(customerToken));

    expect(cancelled.status).toBe(204);

    const afterCancel = await request(app).get("/products");
    const productAfterCancel = afterCancel.body.find(
      (product) => product.id === stockedProductId,
    );
    expect(productAfterCancel.stock).toBe(productBefore.stock);
  });
});
