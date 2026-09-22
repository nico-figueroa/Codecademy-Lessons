import request from "supertest";
import app from "../app.js";

let customerToken;
let orderId;

beforeAll(async () => {
  const login = await request(app).post("/auth/login").send({
    email: "customer@example.com",
    password: "Password123!",
  });

  customerToken = login.body.accessToken;

  // Add item to cart
  const products = await request(app).get("/products");
  const productId = products.body[0].id;

  await request(app)
    .post("/carts/me/items")
    .set("Authorization", `Bearer ${customerToken}`)
    .send({ productId, quantity: 1 });

  // Place order
  const orderRes = await request(app)
    .post("/orders")
    .set("Authorization", `Bearer ${customerToken}`);

  orderId = orderRes.body.id;
});

describe("Payments API", () => {
  test("Customer can create a payment", async () => {
    const res = await request(app)
      .post("/payments")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        orderId,
        provider: "testpay",
        dummyToken: "test_approved",
      });

    expect(res.status).toBe(201);
    expect(res.body.orderId).toBe(orderId);
    expect(res.body.status).toBe("captured");
    expect(res.body.outcome).toBe("approved");
  });

  test("Customer can retrieve payment", async () => {
    const paymentList = await request(app)
      .get(`/orders/${orderId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    const paymentId = paymentList.body.paymentReference;

    const res = await request(app)
      .get(`/payments/${paymentId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(paymentId);
  });

  test("Customer can record a declined payment", async () => {
    const products = await request(app).get("/products");

    await request(app)
      .post("/carts/me/items")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ productId: products.body[0].id, quantity: 1 });

    const orderRes = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${customerToken}`);

    const paymentRes = await request(app)
      .post("/payments")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        orderId: orderRes.body.id,
        provider: "testpay",
        dummyToken: "test_declined",
      });

    expect(paymentRes.status).toBe(201);
    expect(paymentRes.body.status).toBe("failed");
    expect(paymentRes.body.outcome).toBe("declined");

    const updatedOrder = await request(app)
      .get(`/orders/${orderRes.body.id}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(updatedOrder.body.paymentStatus).toBe("failed");
  });
});
