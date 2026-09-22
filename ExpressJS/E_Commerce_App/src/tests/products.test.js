import request from "supertest";
import app from "../app.js";

let adminToken;

function authHeader(token) {
  return "Bearer " + token;
}

beforeAll(async () => {
  const res = await request(app).post("/auth/login").send({
    email: "admin@example.com",
    password: "Password123!",
  });

  adminToken = res.body.accessToken;
});

describe("Products API", () => {
  test("List products", async () => {
    const res = await request(app).get("/products");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("Admin can create a product", async () => {
    const res = await request(app)
      .post("/products")
      .set("Authorization", authHeader(adminToken))
      .send({
        name: "Test Product",
        description: "Test Desc",
        price: 10.99,
        currency: "USD",
        stock: 5,
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test Product");
  });

  test("Admin can update a product", async () => {
    const list = await request(app).get("/products");
    const productId = list.body[0].id;

    const res = await request(app)
      .put(`/products/${productId}`)
      .set("Authorization", authHeader(adminToken))
      .send({ stock: 999 });

    expect(res.status).toBe(200);
    expect(res.body.stock).toBe(999);
  });

  test("Admin cannot create a product with negative values", async () => {
    const res = await request(app)
      .post("/products")
      .set("Authorization", authHeader(adminToken))
      .send({
        name: "Broken Product",
        price: -1,
        stock: -5,
      });

    expect(res.status).toBe(400);
  });

  test("Admin cannot update a product with negative values", async () => {
    const list = await request(app).get("/products");
    const productId = list.body[0].id;

    const res = await request(app)
      .put(`/products/${productId}`)
      .set("Authorization", authHeader(adminToken))
      .send({ price: -1, stock: -1 });

    expect(res.status).toBe(400);
  });

  test("Archived products are hidden from public lookup", async () => {
    const created = await request(app)
      .post("/products")
      .set("Authorization", authHeader(adminToken))
      .send({
        name: "Archived Product",
        description: "Temporary product",
        price: 25,
        currency: "USD",
        stock: 1,
      });

    expect(created.status).toBe(201);

    const archive = await request(app)
      .delete(`/products/${created.body.id}`)
      .set("Authorization", authHeader(adminToken));

    expect(archive.status).toBe(204);

    const lookup = await request(app).get(`/products/${created.body.id}`);

    expect(lookup.status).toBe(404);
  });
});
