import request from "supertest";
import app from "../app.js";
import { TEST_ADDRESS } from "./setup/address.mjs";

const bearer = (t) => "Bearer " + t;
let adminToken;
let adminId;
let customerToken;
let customerId;
let orderId;

async function login(email) {
  const res = await request(app)
    .post("/auth/login")
    .send({ email, password: "Password123!" });
  return res.body.accessToken;
}

beforeAll(async () => {
  adminToken = await login("admin@example.com");
  adminId = (
    await request(app).get("/auth/me").set("Authorization", bearer(adminToken))
  ).body.id;
  await request(app)
    .post("/auth/register")
    .send({ email: "adminusers@example.com", password: "Password123!" });
  customerToken = await login("adminusers@example.com");
  customerId = (
    await request(app)
      .get("/auth/me")
      .set("Authorization", bearer(customerToken))
  ).body.id;
});

afterAll(async () => {
  if (orderId) {
    await request(app)
      .put(`/orders/${orderId}`)
      .set("Authorization", bearer(adminToken))
      .send({ status: "cancelled" });
  }
});

describe("Admin user management", () => {
  const email = `crud-${Date.now()}@example.com`;
  let id;

  test("admin creates a user with profile details", async () => {
    const res = await request(app)
      .post("/users")
      .set("Authorization", bearer(adminToken))
      .send({
        email,
        password: "Password123!",
        name: "Crud User",
        phone: "555-0100",
        address: { city: "Austin", country: "US" },
      });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Crud User");
    expect(res.body.address.city).toBe("Austin");
    id = res.body.id;
  });

  test("admin edits the user and resets the password", async () => {
    const res = await request(app)
      .put(`/users/${id}`)
      .set("Authorization", bearer(adminToken))
      .send({ name: "Renamed", password: "NewPassword123!" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Renamed");

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email, password: "NewPassword123!" });
    expect(loginRes.status).toBe(200);
  });

  test("deactivated users are hidden unless includeInactive is set", async () => {
    await request(app)
      .delete(`/users/${id}`)
      .set("Authorization", bearer(adminToken));

    const active = await request(app)
      .get("/users")
      .set("Authorization", bearer(adminToken));
    expect(active.body.some((u) => u.id === id)).toBe(false);

    const all = await request(app)
      .get("/users?includeInactive=true")
      .set("Authorization", bearer(adminToken));
    expect(all.body.find((u) => u.id === id)?.isActive).toBe(false);

    const re = await request(app)
      .put(`/users/${id}`)
      .set("Authorization", bearer(adminToken))
      .send({ isActive: true });
    expect(re.body.isActive).toBe(true);
  });

  test("admin cannot deactivate or demote themself", async () => {
    const del = await request(app)
      .delete(`/users/${adminId}`)
      .set("Authorization", bearer(adminToken));
    expect(del.status).toBe(400);

    const demote = await request(app)
      .put(`/users/${adminId}`)
      .set("Authorization", bearer(adminToken))
      .send({ role: "customer" });
    expect(demote.status).toBe(400);
  });

  test("customers cannot manage users", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", bearer(customerToken));
    expect(res.status).toBe(403);
  });
});

describe("Admin assigns an order to a user", () => {
  test("admin reassigns a pending order; customers cannot", async () => {
    const adminCart = await request(app)
      .post("/carts/me")
      .set("Authorization", bearer(adminToken));
    expect(adminCart.status).toBeLessThan(300);
    const products = await request(app).get("/products");
    await request(app)
      .post("/carts/me/items")
      .set("Authorization", bearer(adminToken))
      .send({ productId: products.body[0].id, quantity: 1 });
    const order = await request(app)
      .post("/orders")
      .set("Authorization", bearer(adminToken))
      .send({ shippingAddress: TEST_ADDRESS });
    expect(order.status).toBe(201);
    orderId = order.body.id;

    const denied = await request(app)
      .put(`/orders/${orderId}`)
      .set("Authorization", bearer(customerToken))
      .send({ userId: customerId });
    expect(denied.status).toBe(403);

    const res = await request(app)
      .put(`/orders/${orderId}`)
      .set("Authorization", bearer(adminToken))
      .send({ userId: customerId });
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(customerId);

    const missing = await request(app)
      .put(`/orders/${orderId}`)
      .set("Authorization", bearer(adminToken))
      .send({ userId: "00000000-0000-4000-8000-000000000000" });
    expect(missing.status).toBe(404);
  });
});
