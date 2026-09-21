import request from "supertest";
import app from "../app.js";

let customerToken;

beforeAll(async () => {
  const res = await request(app).post("/auth/login").send({
    email: "customer@example.com",
    password: "Password123!",
  });

  customerToken = res.body.accessToken;
});

describe("Carts API", () => {
  test("Customer can get their cart", async () => {
    const res = await request(app)
      .get("/carts/me")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
  });

  test("Customer can add item to cart", async () => {
    const products = await request(app).get("/products");
    const productId = products.body[0].id;

    const res = await request(app)
      .post("/carts/me/items")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        productId,
        quantity: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  test("Customer can update cart item", async () => {
    const cart = await request(app)
      .get("/carts/me")
      .set("Authorization", `Bearer ${customerToken}`);

    const itemId = cart.body.items[0].id;

    const res = await request(app)
      .put(`/carts/me/items/${itemId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(5);
  });
});
