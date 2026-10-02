import { TEST_ADDRESS } from "./setup/address.mjs";
import { jest } from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import stripeClient from "../utils/stripeClient.js";

let customerToken;
let adminToken;

async function placeOrder(token) {
  const products = await request(app).get("/products");
  const productId = products.body[0].id;

  await request(app)
    .post("/carts/me/items")
    .set("Authorization", `Bearer ${token}`)
    .send({ productId, quantity: 1 });

  const orderRes = await request(app)
    .post("/orders")
      .send({ shippingAddress: TEST_ADDRESS })
    .set("Authorization", `Bearer ${token}`);

  return orderRes.body.id;
}

function fakePaymentIntent(overrides = {}) {
  return {
    id: `pi_fake_${Math.random().toString(36).slice(2)}`,
    client_secret: `pi_fake_secret_${Math.random().toString(36).slice(2)}`,
    ...overrides,
  };
}

beforeAll(async () => {
  const login = await request(app).post("/auth/login").send({
    email: "customer@example.com",
    password: "Password123!",
  });
  customerToken = login.body.accessToken;

  const adminLogin = await request(app).post("/auth/login").send({
    email: "admin@example.com",
    password: "Password123!",
  });
  adminToken = adminLogin.body.accessToken;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Payments API", () => {
  test("Customer can create a Stripe PaymentIntent for their order", async () => {
    const orderId = await placeOrder(customerToken);
    const intent = fakePaymentIntent();
    stripeClient.paymentIntents.create = jest.fn().mockResolvedValue(intent);

    const res = await request(app)
      .post("/payments/intent")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ orderId });

    expect(res.status).toBe(201);
    expect(res.body.clientSecret).toBe(intent.client_secret);
    expect(res.body.paymentId).toBeDefined();
    expect(stripeClient.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        currency: "usd",
        metadata: { orderId },
      }),
    );
  });

  test("Re-requesting an intent for the same order reuses the existing PaymentIntent", async () => {
    const orderId = await placeOrder(customerToken);
    const firstIntent = fakePaymentIntent();
    stripeClient.paymentIntents.create = jest
      .fn()
      .mockResolvedValue(firstIntent);

    const first = await request(app)
      .post("/payments/intent")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ orderId });

    stripeClient.paymentIntents.retrieve = jest
      .fn()
      .mockResolvedValue(firstIntent);

    const second = await request(app)
      .post("/payments/intent")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ orderId });

    expect(second.status).toBe(201);
    expect(second.body.paymentId).toBe(first.body.paymentId);
    expect(second.body.clientSecret).toBe(firstIntent.client_secret);
    expect(stripeClient.paymentIntents.create).toHaveBeenCalledTimes(1);
    expect(stripeClient.paymentIntents.retrieve).toHaveBeenCalledWith(
      firstIntent.id,
    );
  });

  test("Customer can retrieve their own payment", async () => {
    const orderId = await placeOrder(customerToken);
    stripeClient.paymentIntents.create = jest
      .fn()
      .mockResolvedValue(fakePaymentIntent());

    const intentRes = await request(app)
      .post("/payments/intent")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ orderId });

    const res = await request(app)
      .get(`/payments/${intentRes.body.paymentId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(intentRes.body.paymentId);
    expect(res.body.status).toBe("pending");
  });

  test("Another customer cannot create a PaymentIntent for someone else's order", async () => {
    const orderId = await placeOrder(customerToken);
    stripeClient.paymentIntents.create = jest
      .fn()
      .mockResolvedValue(fakePaymentIntent());

    const otherLogin = await request(app).post("/auth/register").send({
      email: `other-${Date.now()}@example.com`,
      password: "Password123!",
    });
    const otherLoginRes = await request(app).post("/auth/login").send({
      email: otherLogin.body.email,
      password: "Password123!",
    });

    const res = await request(app)
      .post("/payments/intent")
      .set("Authorization", `Bearer ${otherLoginRes.body.accessToken}`)
      .send({ orderId });

    expect(res.status).toBe(403);
  });

  test("Creating a PaymentIntent for an already-paid order is rejected", async () => {
    const orderId = await placeOrder(customerToken);
    const intent = fakePaymentIntent();
    stripeClient.paymentIntents.create = jest.fn().mockResolvedValue(intent);

    await request(app)
      .post("/payments/intent")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ orderId });

    stripeClient.webhooks.constructEvent = jest.fn().mockReturnValue({
      type: "payment_intent.succeeded",
      data: { object: { id: intent.id } },
    });

    await request(app)
      .post("/payments/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", "test-signature")
      .send(JSON.stringify({ any: "payload" }));

    const res = await request(app)
      .post("/payments/intent")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ orderId });

    expect(res.status).toBe(409);
  });

  test("Stripe webhook marks a payment and order as paid on payment_intent.succeeded", async () => {
    const orderId = await placeOrder(customerToken);
    const intent = fakePaymentIntent();
    stripeClient.paymentIntents.create = jest.fn().mockResolvedValue(intent);

    const intentRes = await request(app)
      .post("/payments/intent")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ orderId });

    stripeClient.webhooks.constructEvent = jest.fn().mockReturnValue({
      type: "payment_intent.succeeded",
      data: { object: { id: intent.id } },
    });

    const webhookRes = await request(app)
      .post("/payments/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", "test-signature")
      .send(JSON.stringify({ any: "payload" }));

    expect(webhookRes.status).toBe(200);
    expect(webhookRes.body.received).toBe(true);

    const payment = await request(app)
      .get(`/payments/${intentRes.body.paymentId}`)
      .set("Authorization", `Bearer ${customerToken}`);
    expect(payment.body.status).toBe("captured");

    const order = await request(app)
      .get(`/orders/${orderId}`)
      .set("Authorization", `Bearer ${customerToken}`);
    expect(order.body.paymentStatus).toBe("paid");
  });

  test("Stripe webhook marks a payment and order as failed on payment_intent.payment_failed", async () => {
    const orderId = await placeOrder(customerToken);
    const intent = fakePaymentIntent();
    stripeClient.paymentIntents.create = jest.fn().mockResolvedValue(intent);

    const intentRes = await request(app)
      .post("/payments/intent")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ orderId });

    stripeClient.webhooks.constructEvent = jest.fn().mockReturnValue({
      type: "payment_intent.payment_failed",
      data: {
        object: {
          id: intent.id,
          last_payment_error: { message: "Your card was declined." },
        },
      },
    });

    const webhookRes = await request(app)
      .post("/payments/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", "test-signature")
      .send(JSON.stringify({ any: "payload" }));

    expect(webhookRes.status).toBe(200);

    const payment = await request(app)
      .get(`/payments/${intentRes.body.paymentId}`)
      .set("Authorization", `Bearer ${customerToken}`);
    expect(payment.body.status).toBe("failed");
    expect(payment.body.failureMessage).toBe("Your card was declined.");

    const order = await request(app)
      .get(`/orders/${orderId}`)
      .set("Authorization", `Bearer ${customerToken}`);
    expect(order.body.paymentStatus).toBe("failed");
  });

  test("A successful payment clears only the purchased items from the cart", async () => {
    await request(app)
      .post("/carts/me")
      .set("Authorization", `Bearer ${customerToken}`);

    const products = await request(app).get("/products");
    const productId = products.body[0].id;

    await request(app)
      .post("/carts/me/items")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ productId, quantity: 1 });

    const orderRes = await request(app)
      .post("/orders")
      .send({ shippingAddress: TEST_ADDRESS })
      .set("Authorization", `Bearer ${customerToken}`);
    const orderId = orderRes.body.id;

    const intent = fakePaymentIntent();
    stripeClient.paymentIntents.create = jest.fn().mockResolvedValue(intent);

    await request(app)
      .post("/payments/intent")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ orderId });

    const cartBeforePayment = await request(app)
      .get("/carts/me")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(
      cartBeforePayment.body.items.some((item) => item.productId === productId),
    ).toBe(true);

    stripeClient.webhooks.constructEvent = jest.fn().mockReturnValue({
      type: "payment_intent.succeeded",
      data: { object: { id: intent.id } },
    });

    await request(app)
      .post("/payments/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", "test-signature")
      .send(JSON.stringify({ any: "payload" }));

    const cartAfterPayment = await request(app)
      .get("/carts/me")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(
      cartAfterPayment.body.items.some((item) => item.productId === productId),
    ).toBe(false);
  });

  test("A failed payment leaves the cart untouched", async () => {
    await request(app)
      .post("/carts/me")
      .set("Authorization", `Bearer ${customerToken}`);

    const products = await request(app).get("/products");
    const productId = products.body[0].id;

    await request(app)
      .post("/carts/me/items")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ productId, quantity: 1 });

    const orderRes = await request(app)
      .post("/orders")
      .send({ shippingAddress: TEST_ADDRESS })
      .set("Authorization", `Bearer ${customerToken}`);
    const orderId = orderRes.body.id;

    const intent = fakePaymentIntent();
    stripeClient.paymentIntents.create = jest.fn().mockResolvedValue(intent);

    await request(app)
      .post("/payments/intent")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ orderId });

    stripeClient.webhooks.constructEvent = jest.fn().mockReturnValue({
      type: "payment_intent.payment_failed",
      data: {
        object: {
          id: intent.id,
          last_payment_error: { message: "Your card was declined." },
        },
      },
    });

    await request(app)
      .post("/payments/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", "test-signature")
      .send(JSON.stringify({ any: "payload" }));

    const cartAfterFailure = await request(app)
      .get("/carts/me")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(
      cartAfterFailure.body.items.some((item) => item.productId === productId),
    ).toBe(true);
  });

  test("Stripe webhook rejects requests with an invalid signature", async () => {
    stripeClient.webhooks.constructEvent = jest.fn().mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const res = await request(app)
      .post("/payments/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", "bad-signature")
      .send(JSON.stringify({ any: "payload" }));

    expect(res.status).toBe(400);
  });

  test("Admins can view any customer's payment", async () => {
    const orderId = await placeOrder(customerToken);
    stripeClient.paymentIntents.create = jest
      .fn()
      .mockResolvedValue(fakePaymentIntent());

    const intentRes = await request(app)
      .post("/payments/intent")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ orderId });

    const res = await request(app)
      .get(`/payments/${intentRes.body.paymentId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});
