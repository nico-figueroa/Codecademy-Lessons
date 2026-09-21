import request from "supertest";
import app from "../app.js";

let adminToken;
let customerToken;

beforeAll(async () => {
  const res = await request(app).post("/auth/login").send({
    email: "admin@example.com",
    password: "Password123!",
  });

  adminToken = res.body.accessToken;

  const customerLogin = await request(app).post("/auth/login").send({
    email: "customer@example.com",
    password: "Password123!",
  });
  customerToken = customerLogin.body.accessToken;
});

describe("Users API", () => {
  test("Admin can list users", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("Admin can create a new user", async () => {
    const res = await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "admin-created@example.com",
        password: "Password123!",
        role: "customer",
      });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("admin-created@example.com");
  });

  test("Admin can update a user", async () => {
    const list = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${adminToken}`);

    const userId = list.body.find((u) => u.email === "customer@example.com").id;

    const res = await request(app)
      .put(`/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "vendor" });

    expect(res.status).toBe(200);
    expect(res.body.role).toBe("vendor");
  });

  test("Customer cannot access user administration", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });
});
