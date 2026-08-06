import { initializePlayer } from "../utils/spotifyPlayer";

const runtimeEnv = typeof import.meta !== "undefined" ? import.meta.env : undefined;

// --- PKCE HELPERS ---
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = window.crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
};

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

export function getRedirectUri(configuredRedirectUri = runtimeEnv?.VITE_SPOTIFY_REDIRECT_URI) {
  if (configuredRedirectUri) {
    try {
      const parsed = new URL(configuredRedirectUri);
      if (parsed.pathname === "/" || parsed.pathname === "") {
        parsed.pathname = "/callback";
      }
      return parsed.toString().replace(/\/$/, "");
    } catch {
      return configuredRedirectUri.endsWith("/callback")
        ? configuredRedirectUri
        : `${configuredRedirectUri.replace(/\/$/, "")}/callback`;
    }
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/callback`;
  }

  return "/callback";
}

export function getAuthorizationCodeFromUrl(url = window.location.href) {
  if (typeof url !== "string") {
    return null;
  }

  try {
    const params = new URLSearchParams(new URL(url).search);
    return params.get("code");
  } catch {
    return null;
  }
}

// --- MAIN AUTH FUNCTION ---
export async function getAccessToken() {
  const existingToken = localStorage.getItem("access_token");
  if (existingToken) {
    return existingToken;
  }

  const clientId = runtimeEnv?.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = getRedirectUri();
  const code = getAuthorizationCodeFromUrl();

  if (!clientId) {
    console.error("Spotify client ID is missing.");
    return null;
  }

  if (code) {
    const codeVerifier = localStorage.getItem("code_verifier");

    if (!codeVerifier) {
      console.error("No code_verifier was stored for the token exchange.");
      return null;
    }

    try {
      const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(tokenData.error_description || tokenData.error || "Token exchange failed.");
      }

      localStorage.setItem("access_token", tokenData.access_token);
      if (tokenData.refresh_token) {
        localStorage.setItem("refresh_token", tokenData.refresh_token);
      }

      if (typeof window !== "undefined" && typeof window.initializePlayer === "function") {
        window.initializePlayer(tokenData.access_token);
      }

      window.history.replaceState({}, "", window.location.pathname);
      return tokenData.access_token;
    } catch (error) {
      console.error("Spotify token exchange failed:", error);
      return null;
    }
  }

  let codeVerifier = localStorage.getItem("code_verifier");

  if (!codeVerifier) {
    codeVerifier = generateRandomString(128);
    localStorage.setItem("code_verifier", codeVerifier);
  }

  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  const scope = [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-modify-playback-state",
    "user-read-playback-state",
    "playlist-modify-public",
    "playlist-modify-private",
    "playlist-read-private",
    "playlist-read-collaborative"
  ].join(" ");

  const authUrl = new URL("https://accounts.spotify.com/authorize");
  const params = {
    response_type: "code",
    client_id: clientId,
    scope,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.assign(authUrl.toString());
  return null;
}
