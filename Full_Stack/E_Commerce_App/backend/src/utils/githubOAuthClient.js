// Thin wrapper around GitHub's OAuth HTTP endpoints.
//
// This is exported as a plain mutable object (rather than individual named
// function exports) so that tests can monkey-patch the methods directly
// (e.g. `githubOAuthClient.exchangeCodeForAccessToken = jest.fn(...)`)
// without needing ESM module-mocking machinery.

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";
const GITHUB_EMAILS_URL = "https://api.github.com/user/emails";

export const githubOAuthClient = {
  // Builds the URL the browser is redirected to in order to let the user
  // authorize this app on GitHub.
  buildAuthorizeUrl(state) {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_REDIRECT_URI;

    const url = new URL(GITHUB_AUTHORIZE_URL);
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("scope", "read:user user:email");
    url.searchParams.set("state", state);

    return url.toString();
  },

  // Exchanges the one-time authorization code for an access token.
  async exchangeCodeForAccessToken(code) {
    const response = await fetch(GITHUB_TOKEN_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error || !data.access_token) {
      throw new Error(
        data.error_description || data.error || "GitHub token exchange failed",
      );
    }

    return data.access_token;
  },

  // Fetches the authenticated GitHub user's profile.
  async fetchGithubUser(accessToken) {
    const response = await fetch(GITHUB_USER_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "ecommerce-app",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch GitHub user profile");
    }

    return response.json();
  },

  // GitHub only returns `email` on the user profile when it's public, so we
  // additionally fetch the email list and pick the primary, verified one.
  async fetchPrimaryEmail(accessToken) {
    const response = await fetch(GITHUB_EMAILS_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "ecommerce-app",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch GitHub user emails");
    }

    const emails = await response.json();
    const primary = emails.find((entry) => entry.primary && entry.verified);
    const anyVerified = emails.find((entry) => entry.verified);

    return primary?.email || anyVerified?.email || emails[0]?.email || null;
  },
};

export default githubOAuthClient;
