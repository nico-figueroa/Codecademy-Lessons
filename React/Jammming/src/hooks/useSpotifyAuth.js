// --- PKCE HELPERS ---
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = window.crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const sha256 = async (plain) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// --- MAIN AUTH FUNCTION ---

export async function getAccessToken() {
  
  // --- SPOTIFY AUTH CONFIG ---
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

  let codeVerifier = localStorage.getItem('code_verifier');

  if (!codeVerifier) {
    codeVerifier = generateRandomString(64);
    localStorage.setItem('code_verifier', codeVerifier);
  }

  const hashed = await sha256(codeVerifier)
  const codeChallenge = base64encode(hashed);

  const scope = 'playlist-modify-public playlist-modify-private';
  const authUrl = new URL("https://accounts.spotify.com/authorize")

  // window.localStorage.setItem('code_verifier', codeVerifier);

  const params =  {
    response_type: 'code',
    client_id: clientId,
    scope,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  }

  authUrl.search = new URLSearchParams(params).toString();
 
  // Parse the URL to retrieve the code parameter
  const urlParams = new URLSearchParams(window.location.search);
  let code = urlParams.get("code");

  if (!code) {
    window.location.href = authUrl.toString();
    return; // prevent running the rest
  }
 
  const getToken = async code => {

    // stored in the previous step
    const codeVerifier = localStorage.getItem('code_verifier');

    const url = "https://accounts.spotify.com/api/token";
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    }

    const body = await fetch(url, payload);
    const response = await body.json();

    localStorage.setItem('access_token', response.access_token);
    window.history.replaceState({}, document.title, redirectUri);

  }

  await getToken(code);

  const storedToken = localStorage.getItem('access_token');
  if (storedToken) {
    return storedToken;
  }
  
}


