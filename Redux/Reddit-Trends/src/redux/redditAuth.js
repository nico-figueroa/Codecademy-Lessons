// Application-only OAuth ("installed client" grant) for Reddit's read-only API.
// No client secret and no end-user login are involved — this only proves the
// request is coming from this app, using a public client_id.
const TOKEN_ENDPOINT = "/reddit-oauth/api/v1/access_token";
const CLIENT_ID = import.meta.env.VITE_REDDIT_CLIENT_ID;

let cachedToken = null;
let cachedExpiryMs = 0;

function getDeviceId() {
  let deviceId = localStorage.getItem("reddit_device_id");
  if (!deviceId) {
    deviceId = crypto.randomUUID().replace(/-/g, "");
    localStorage.setItem("reddit_device_id", deviceId);
  }
  return deviceId;
}

export async function getAccessToken() {
  if (cachedToken && Date.now() < cachedExpiryMs) {
    return cachedToken;
  }

  if (!CLIENT_ID) {
    throw new Error(
      "Missing VITE_REDDIT_CLIENT_ID. Create a Reddit 'installed app' at https://www.reddit.com/prefs/apps and add its client id to .env"
    );
  }

  const body = new URLSearchParams({
    grant_type: "https://oauth.reddit.com/grants/installed_client",
    device_id: getDeviceId()
  });

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      // Installed apps have no secret, so the password half of Basic auth is empty.
      Authorization: `Basic ${btoa(`${CLIENT_ID}:`)}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    throw new Error("Failed to authenticate with Reddit");
  }

  const json = await response.json();
  cachedToken = json.access_token;
  cachedExpiryMs = Date.now() + (json.expires_in - 60) * 1000;

  return cachedToken;
}
