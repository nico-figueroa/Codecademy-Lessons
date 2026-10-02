import { jest } from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import { githubOAuthClient } from "../utils/githubOAuthClient.js";

// Completes the confirmation step that follows the GitHub callback.
async function confirmTicket(callback) {
  const ticket = callback.headers.location.split("#ticket=")[1];
  const pending = await request(app).get(`/auth/oauth/pending/${ticket}`);
  expect(pending.status).toBe(200);
  const confirmed = await request(app).post("/auth/oauth/confirm").send({ ticket });
  expect(confirmed.status).toBe(200);
  return confirmed.body.accessToken;
}

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
    expect(res.body.isActive).toBe(true);
    expect(res.body.createdAt).toBeDefined();
    expect(res.body.updatedAt).toBeDefined();
  });

  test("GET /auth/me returns the authenticated user's profile", async () => {
    const login = await request(app).post("/auth/login").send({
      email: "admin@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${login.body.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("admin@example.com");
    expect(res.body.role).toBe("admin");
  });

  test("GET /auth/me rejects requests without a token", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
  });

  test("Starting OAuth with an unsupported provider is rejected", async () => {
    const res = await request(app).get("/auth/oauth/google/start");
    expect(res.status).toBe(400);
  });

  test("GitHub OAuth start redirects to GitHub's authorize URL with a state param", async () => {
    const res = await request(app).get("/auth/oauth/github/start");

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain(
      "https://github.com/login/oauth/authorize",
    );
    expect(res.headers.location).toContain("state=");
  });

  test("GitHub OAuth callback issues a token for a new user on success", async () => {
    const start = await request(app).get("/auth/oauth/github/start");
    const state = new URL(start.headers.location).searchParams.get("state");

    githubOAuthClient.exchangeCodeForAccessToken = jest
      .fn()
      .mockResolvedValue("fake-github-access-token");
    githubOAuthClient.fetchGithubUser = jest.fn().mockResolvedValue({
      id: 987654,
      login: "octocat",
      name: "Octo Cat",
      email: null,
    });
    githubOAuthClient.fetchPrimaryEmail = jest
      .fn()
      .mockResolvedValue("octocat@example.com");

    const callback = await request(app)
      .get("/auth/oauth/github/callback")
      .query({ code: "fake-code", state });

    expect(callback.status).toBe(302);
    expect(callback.headers.location).toMatch(/\/oauth\/confirm#ticket=.+/);

    const token = await confirmTicket(callback);

    const me = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(me.status).toBe(200);
    expect(me.body.email).toBe("octocat@example.com");
    expect(me.body.name).toBe("Octo Cat");
  });

  test("GitHub OAuth callback links to an existing account by email", async () => {
    const start = await request(app).get("/auth/oauth/github/start");
    const state = new URL(start.headers.location).searchParams.get("state");

    githubOAuthClient.exchangeCodeForAccessToken = jest
      .fn()
      .mockResolvedValue("fake-github-access-token-2");
    githubOAuthClient.fetchGithubUser = jest.fn().mockResolvedValue({
      id: 111222,
      login: "customer-on-github",
      name: "Customer",
      email: "customer@example.com",
    });
    githubOAuthClient.fetchPrimaryEmail = jest.fn();

    const callback = await request(app)
      .get("/auth/oauth/github/callback")
      .query({ code: "fake-code-2", state });

    expect(callback.status).toBe(302);
    const token = await confirmTicket(callback);

    const me = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(me.status).toBe(200);
    expect(me.body.email).toBe("customer@example.com");
    expect(githubOAuthClient.fetchPrimaryEmail).not.toHaveBeenCalled();
  });

  test("GitHub OAuth start can request the account picker", async () => {
    const res = await request(app).get("/auth/oauth/github/start?select=1");
    expect(new URL(res.headers.location).searchParams.get("prompt")).toBe("select_account");
  });

  test("An unknown GitHub ticket cannot be confirmed", async () => {
    const res = await request(app).post("/auth/oauth/confirm").send({ ticket: "00000000-0000-4000-8000-000000000000" });
    expect(res.status).toBe(404);
  });

  test("GitHub OAuth callback redirects with an error for invalid/expired state", async () => {
    const callback = await request(app).get("/auth/oauth/github/callback").query({
      code: "fake-code",
      state: "5f0c9f35-6073-43c3-891b-3cd5ae662170",
    });

    expect(callback.status).toBe(302);
    expect(callback.headers.location).toMatch(/\/oauth\/callback#error=/);
  });

  test("GitHub OAuth callback redirects with an error when GitHub reports denial", async () => {
    const callback = await request(app).get("/auth/oauth/github/callback").query({
      error: "access_denied",
      error_description: "The user denied the request",
    });

    expect(callback.status).toBe(302);
    expect(callback.headers.location).toMatch(/\/oauth\/callback#error=/);
  });
});
