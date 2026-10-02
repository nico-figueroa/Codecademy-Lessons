import request from "supertest";
import app from "../app.js";
import shippoClient from "../utils/shippoClient.js";
import { TEST_ADDRESS } from "./setup/address.mjs";

const bearer = (t) => "Bearer " + t;
let adminToken;
let customerToken;
const createdOrders = [];

async function login(email) {
  const res = await request(app)
    .post("/auth/login")
    .send({ email, password: "Password123!" });
  return res.body.accessToken;
}

beforeAll(async () => {
  adminToken = await login("admin@example.com");
  await request(app)
    .post("/auth/register")
    .send({ email: "features@example.com", password: "Password123!" });
  customerToken = await login("features@example.com");
});

afterAll(async () => {
  // Release reserved stock so other suites are unaffected.
  for (const id of createdOrders) {
    await request(app)
      .put(`/orders/${id}`)
      .set("Authorization", bearer(adminToken))
      .send({ status: "cancelled" });
  }
});

describe("Profile", () => {
  test("customer can save a profile with a default address", async () => {
    const res = await request(app)
      .put("/auth/me")
      .set("Authorization", bearer(customerToken))
      .send({
        name: "Casey Customer",
        phone: "555-0101",
        address: {
          line1: "9 Main St",
          city: "Denver",
          state: "CO",
          postalCode: "80201",
          country: "US",
        },
      });
    expect(res.status).toBe(200);
    expect(res.body.address.city).toBe("Denver");

    const me = await request(app)
      .get("/auth/me")
      .set("Authorization", bearer(customerToken));
    expect(me.body.name).toBe("Casey Customer");
  });
});

describe("Orders with addresses", () => {
  async function fillCart(token) {
    const products = await request(app).get("/products");
    await request(app).post("/carts/me").set("Authorization", bearer(token));
    await request(app)
      .post("/carts/me/items")
      .set("Authorization", bearer(token))
      .send({ productId: products.body[0].id, quantity: 1 });
  }

  test("order falls back to the profile address", async () => {
    await fillCart(customerToken);
    const res = await request(app)
      .post("/orders")
      .set("Authorization", bearer(customerToken));
    createdOrders.push(res.body.id);
    expect(res.status).toBe(201);
    expect(res.body.shippingAddress.city).toBe("Denver");
  });

  test("order without any address is rejected", async () => {
    await request(app)
      .post("/auth/register")
      .send({ email: "noaddr@example.com", password: "Password123!" });
    const token = await login("noaddr@example.com");
    await fillCart(token);
    const res = await request(app)
      .post("/orders")
      .set("Authorization", bearer(token));
    expect(res.status).toBe(400);
  });

  test("admin can ship a paid order once; others are blocked", async () => {
    await fillCart(customerToken);
    const order = await request(app)
      .post("/orders")
      .set("Authorization", bearer(customerToken))
      .send({ shippingAddress: TEST_ADDRESS });
    const id = order.body.id;
    createdOrders.push(id);

    const early = await request(app)
      .post(`/orders/${id}/shipment`)
      .set("Authorization", bearer(adminToken));
    expect(early.status).toBeGreaterThanOrEqual(400);

    await request(app)
      .put(`/orders/${id}`)
      .set("Authorization", bearer(adminToken))
      .send({ status: "paid" });

    const denied = await request(app)
      .post(`/orders/${id}/shipment`)
      .set("Authorization", bearer(customerToken));
    expect(denied.status).toBe(403);

    shippoClient.createLabel = async () => ({
      provider: "simulated",
      carrier: "USPS",
      service: "Priority",
      trackingNumber: "TRK123",
      trackingUrl: "https://example.com/t",
      labelUrl: "https://example.com/l.pdf",
      rate: 5,
      currency: "USD",
    });
    const ok = await request(app)
      .post(`/orders/${id}/shipment`)
      .set("Authorization", bearer(adminToken));
    expect(ok.status).toBe(201);

    const dup = await request(app)
      .post(`/orders/${id}/shipment`)
      .set("Authorization", bearer(adminToken));
    expect(dup.status).toBe(409);
  });
});

describe("Admin products and root page", () => {
  test("admin can list all products; customers cannot", async () => {
    const ok = await request(app)
      .get("/products/admin/all")
      .set("Authorization", bearer(adminToken));
    expect(ok.status).toBe(200);
    const no = await request(app)
      .get("/products/admin/all")
      .set("Authorization", bearer(customerToken));
    expect(no.status).toBe(403);
  });

  test("GET / links to the API docs", async () => {
    const html = await request(app).get("/").set("Accept", "text/html");
    expect(html.text).toContain("/api-docs");
    const json = await request(app).get("/").set("Accept", "application/json");
    expect(json.body.docs).toContain("/api-docs");
  });
});
