import client from "./client.js";

// Registers a new customer account. Returns the created user record (no
// token - the caller must log in separately, matching the backend contract).
export function register({ email, password, name }) {
  return client.post("/auth/register", { email, password, name }).then((res) => res.data);
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

// Same flow, but asks GitHub to show its account picker.
export function githubOAuthSelectUrl() {
  return `${client.defaults.baseURL}/auth/oauth/github/start?select=1`;
}

export function updateProfile(profile) {
  return client.put("/auth/me", profile).then((res) => res.data);
}

export function fetchPendingOAuth(ticket) {
  return client.get(`/auth/oauth/pending/${ticket}`).then((res) => res.data);
}

export function confirmOAuth(ticket) {
  return client.post("/auth/oauth/confirm", { ticket }).then((res) => res.data);
}

export function discardOAuth(ticket) {
  return client.post("/auth/oauth/discard", { ticket });
}
