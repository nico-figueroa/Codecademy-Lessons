import request from "supertest";
import app from "../app.js";

const bearer = (t) => "Bearer " + t;
let adminToken;
let vendorToken;
const vendorEmail = `vendor-${Date.now()}@example.com`;

async function login(email) {
  const res = await request(app)
    .post("/auth/login")
    .send({ email, password: "Password123!" });
  return res.body.accessToken;
}

beforeAll(async () => {
  adminToken = await login("admin@example.com");
  await request(app)
    .post("/users")
    .set("Authorization", bearer(adminToken))
    .send({ email: vendorEmail, password: "Password123!", role: "vendor" });
  vendorToken = await login(vendorEmail);
});

describe("Vendor permissions", () => {
  test("vendor can create, update and delete products", async () => {
    const sku = `V-${Date.now()}`;
    const created = await request(app)
      .post("/products")
      .set("Authorization", bearer(vendorToken))
      .send({ name: "Vendor Item", sku, price: 5, stock: 3 });
    expect(created.status).toBe(201);
    const id = created.body.id;

    const all = await request(app)
      .get("/products/admin/all")
      .set("Authorization", bearer(vendorToken));
    expect(all.status).toBe(200);

    const updated = await request(app)
      .put(`/products/${id}`)
      .set("Authorization", bearer(vendorToken))
      .send({ price: 6 });
    expect(updated.status).toBe(200);

    const removed = await request(app)
      .delete(`/products/${id}`)
      .set("Authorization", bearer(vendorToken));
    expect([200, 204]).toContain(removed.status);
  });

  test("vendor can list all orders", async () => {
    const res = await request(app)
      .get("/orders")
      .set("Authorization", bearer(vendorToken));
    expect(res.status).toBe(200);
  });

  test("vendor cannot manage users", async () => {
    const list = await request(app)
      .get("/users")
      .set("Authorization", bearer(vendorToken));
    expect(list.status).toBe(403);
    const create = await request(app)
      .post("/users")
      .set("Authorization", bearer(vendorToken))
      .send({ email: "x@example.com", password: "Password123!" });
    expect(create.status).toBe(403);
  });
});
