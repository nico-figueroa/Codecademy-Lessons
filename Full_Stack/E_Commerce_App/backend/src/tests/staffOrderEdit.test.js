import request from "supertest";
import app from "../app.js";
import { TEST_ADDRESS } from "./setup/address.mjs";

const bearer = (t) => "Bearer " + t;
let adminToken;
let vendorToken;
let customerToken;
let customerId;
let orderId;
let product;
const vendorEmail = `vendor-edit-${Date.now()}@example.com`;

async function login(email) {
  const res = await request(app)
    .post("/auth/login")
    .send({ email, password: "Password123!" });
  return res.body.accessToken;
}

const put = (token, body) =>
  request(app)
    .put(`/orders/${orderId}`)
    .set("Authorization", bearer(token))
    .send(body);

beforeAll(async () => {
  adminToken = await login("admin@example.com");
  await request(app)
    .post("/users")
    .set("Authorization", bearer(adminToken))
    .send({ email: vendorEmail, password: "Password123!", role: "vendor" });
  vendorToken = await login(vendorEmail);
  customerToken = await login("customer@example.com");
  customerId = (
    await request(app).get("/auth/me").set("Authorization", bearer(customerToken))
  ).body.id;

  const created = await request(app)
    .post("/products")
    .set("Authorization", bearer(adminToken))
    .send({ name: "Edit Item", sku: `E-${Date.now()}`, price: 10, stock: 20 });
  product = created.body;

  await request(app).post("/carts/me").set("Authorization", bearer(vendorToken));
  await request(app)
    .post("/carts/me/items")
    .set("Authorization", bearer(vendorToken))
    .send({ productId: product.id, quantity: 1 });
  const order = await request(app)
    .post("/orders")
    .set("Authorization", bearer(vendorToken))
    .send({ shippingAddress: TEST_ADDRESS });
  orderId = order.body.id;
});

describe("Staff order editing", () => {
  test("vendor looks up customers and reassigns the order", async () => {
    const lookup = await request(app)
      .get("/users/lookup")
      .set("Authorization", bearer(vendorToken));
    expect(lookup.status).toBe(200);
    expect(lookup.body.some((u) => u.id === customerId)).toBe(true);

    const denied = await request(app)
      .get("/users/lookup")
      .set("Authorization", bearer(customerToken));
    expect(denied.status).toBe(403);

    const res = await put(vendorToken, { userId: customerId });
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(customerId);
  });

  test("vendor edits quantities and the total and stock follow", async () => {
    const res = await put(vendorToken, {
      items: [{ productId: product.id, quantity: 4 }],
    });
    expect(res.status).toBe(200);
    expect(Number(res.body.totalAmount)).toBe(40);
    const stock = (await request(app).get(`/products/${product.id}`)).body.stock;
    expect(stock).toBe(16);

    const tooMany = await put(vendorToken, {
      items: [{ productId: product.id, quantity: 500 }],
    });
    expect(tooMany.status).toBe(409);
  });

  test("vendor edits the delivery address", async () => {
    const res = await put(vendorToken, {
      shippingAddress: { ...TEST_ADDRESS, city: "Elsewhere" },
    });
    expect(res.status).toBe(200);
    expect(res.body.shippingAddress.city).toBe("Elsewhere");
  });

  test("customers cannot edit items, address or payment status", async () => {
    const res = await put(customerToken, {
      items: [{ productId: product.id, quantity: 1 }],
    });
    expect(res.status).toBe(403);
  });

  test("only admins change payment status", async () => {
    const denied = await put(vendorToken, { paymentStatus: "paid" });
    expect(denied.status).toBe(403);

    const res = await put(adminToken, { paymentStatus: "paid" });
    expect(res.status).toBe(200);
    expect(res.body.paymentStatus).toBe("paid");
    expect(res.body.status).toBe("paid");

    const locked = await put(vendorToken, {
      items: [{ productId: product.id, quantity: 1 }],
    });
    expect(locked.status).toBe(409);
  });

  test("vendor creates, edits and deletes shipment info", async () => {
    const created = await request(app)
      .post(`/orders/${orderId}/shipment`)
      .set("Authorization", bearer(vendorToken))
      .send({ carrier: "UPS", trackingNumber: "1Z999" });
    expect(created.status).toBe(201);

    const updated = await request(app)
      .put(`/orders/${orderId}/shipment`)
      .set("Authorization", bearer(vendorToken))
      .send({ trackingNumber: "1Z000", status: "in_transit" });
    expect(updated.status).toBe(200);
    expect(updated.body.trackingNumber).toBe("1Z000");
    expect(updated.body.status).toBe("in_transit");

    const removed = await request(app)
      .delete(`/orders/${orderId}/shipment`)
      .set("Authorization", bearer(vendorToken));
    expect(removed.status).toBe(204);

    const order = await request(app)
      .get(`/orders/${orderId}`)
      .set("Authorization", bearer(vendorToken));
    expect(order.body.shipment).toBeNull();
    expect(order.body.status).toBe("paid");
  });
});

describe("Order integrity", () => {
  test("a failed item edit leaves the owner and address unchanged", async () => {
    await request(app).post("/carts/me").set("Authorization", bearer(vendorToken));
    await request(app)
      .post("/carts/me/items")
      .set("Authorization", bearer(vendorToken))
      .send({ productId: product.id, quantity: 1 });
    const order = await request(app)
      .post("/orders")
      .set("Authorization", bearer(vendorToken))
      .send({ shippingAddress: TEST_ADDRESS });
    const id = order.body.id;
    const before = order.body;

    const res = await request(app)
      .put(`/orders/${id}`)
      .set("Authorization", bearer(vendorToken))
      .send({
        userId: customerId,
        shippingAddress: { ...TEST_ADDRESS, city: "Changedville" },
        items: [{ productId: product.id, quantity: 500 }],
      });
    expect(res.status).toBe(409);

    const after = await request(app)
      .get(`/orders/${id}`)
      .set("Authorization", bearer(vendorToken));
    expect(after.body.userId).toBe(before.userId);
    expect(after.body.shippingAddress.city).toBe(TEST_ADDRESS.city);
  });

  test("shipped orders cannot be cancelled", async () => {
    await request(app).post("/carts/me").set("Authorization", bearer(vendorToken));
    await request(app)
      .post("/carts/me/items")
      .set("Authorization", bearer(vendorToken))
      .send({ productId: product.id, quantity: 1 });
    const order = await request(app)
      .post("/orders")
      .set("Authorization", bearer(vendorToken))
      .send({ shippingAddress: TEST_ADDRESS });
    const id = order.body.id;

    const shipped = await request(app)
      .put(`/orders/${id}`)
      .set("Authorization", bearer(adminToken))
      .send({ status: "shipped" });
    expect(shipped.status).toBe(200);

    const viaPut = await request(app)
      .put(`/orders/${id}`)
      .set("Authorization", bearer(adminToken))
      .send({ status: "cancelled" });
    expect(viaPut.status).toBe(409);

    const viaDelete = await request(app)
      .delete(`/orders/${id}`)
      .set("Authorization", bearer(adminToken));
    expect(viaDelete.status).toBe(409);
  });
});