import request from "supertest";
import app from "../app.js";

let customerToken;

function authHeader(token) {
  return "Bearer " + token;
}

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
      .set("Authorization", authHeader(customerToken));

    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
  });

  test("Customer can add item to cart", async () => {
    const products = await request(app).get("/products");
    const productId = products.body[0].id;

    const res = await request(app)
      .post("/carts/me/items")
      .set("Authorization", authHeader(customerToken))
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
      .set("Authorization", authHeader(customerToken));

    const itemId = cart.body.items[0].id;

    const res = await request(app)
      .put(`/carts/me/items/${itemId}`)
      .set("Authorization", authHeader(customerToken))
      .send({ quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(5);
  });

  test("Customer cannot add more items than are in stock", async () => {
    await request(app)
      .post("/carts/me")
      .set("Authorization", authHeader(customerToken));

    const products = await request(app).get("/products");
    const product = products.body.find((candidate) => candidate.stock > 0);

    const res = await request(app)
      .post("/carts/me/items")
      .set("Authorization", authHeader(customerToken))
      .send({
        productId: product.id,
        quantity: product.stock + 1,
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Requested quantity exceeds stock");
  });
});
