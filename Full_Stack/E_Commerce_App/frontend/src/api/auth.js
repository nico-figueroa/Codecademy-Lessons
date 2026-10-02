import client from "./client.js";

// Registers a new customer account. Returns the created user record (no
// token - the caller must log in separately, matching the backend contract).
export function register({ email, password }) {
  return client.post("/auth/register", { email, password }).then((res) => res.data);
}

// Logs in with email/password. Returns { accessToken, tokenType, expiresIn }.
export function login({ email, password }) {
  return client.post("/auth/login", { email, password }).then((res) => res.data);
}

// Fetches the current authenticated user's profile.
export function fetchCurrentUser() {
  return client.get("/auth/me").then((res) => res.data);
}

// Builds the URL to start the GitHub OAuth flow. This is a full browser
// redirect (not a fetch call) - the backend itself redirects to GitHub.
export function githubOAuthStartUrl() {
  return `${client.defaults.baseURL}/auth/oauth/github/start`;
}
