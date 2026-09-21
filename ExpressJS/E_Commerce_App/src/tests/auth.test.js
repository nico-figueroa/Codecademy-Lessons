import request from "supertest";
import app from "../app.js";

describe("Auth API", () => {
  test("Login works for seeded admin", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "admin@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  test("Registration creates a new user", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "newuser@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("newuser@example.com");
  });

  test("Dummy OAuth issues a token after a valid state callback", async () => {
    const start = await request(app).post("/auth/oauth/google/start");

    expect(start.status).toBe(200);
    expect(start.body.mode).toBe("dummy");
    expect(start.body.authorizationUrl).toContain(start.body.state);

    const callback = await request(app)
      .post("/auth/oauth/google/callback")
      .send({ state: start.body.state, mockSubject: "test-oauth-user" });

    expect(callback.status).toBe(200);
    expect(callback.body.accessToken).toBeDefined();
  });

  test("Dummy OAuth rejects unknown providers and invalid state", async () => {
    const unknownProvider = await request(app).post("/auth/oauth/github/start");
    const invalidState = await request(app)
      .post("/auth/oauth/google/callback")
      .send({ state: "5f0c9f35-6073-43c3-891b-3cd5ae662170" });

    expect(unknownProvider.status).toBe(400);
    expect(invalidState.status).toBe(400);
  });
});
