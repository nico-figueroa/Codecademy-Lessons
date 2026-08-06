// src/utils/spotifyPlayer.js

let playerInitialized = false;

export function initializePlayer(token) {
  if (!token || !window.Spotify?.Player || playerInitialized) {
    return;
  }

  playerInitialized = true;

  const player = new window.Spotify.Player({
    name: "Jammming Player",
    getOAuthToken: cb => cb(token),
    volume: 0.5
  });

  // --- PLAYER EVENT LISTENERS -------------------------------------------------

  player.addListener("ready", ({ device_id }) => {
    console.log("Ready with Device ID", device_id);

    // Store device ID so React can pick it up
    localStorage.setItem("spotify_device_id", device_id);
    window.dispatchEvent(new CustomEvent("spotify-device-ready", { detail: device_id }));

    // Do NOT resume here — browser gesture required
  });

  player.addListener("not_ready", ({ device_id }) => {
    console.warn("Device ID has gone offline", device_id);
  });

  player.addListener("initialization_error", ({ message }) => {
    console.error("Failed to initialize player:", message);
    window.dispatchEvent(new Event("spotify-player-error"));
  });

  player.addListener("authentication_error", ({ message }) => {
    console.error("Authentication error:", message);
    window.dispatchEvent(new Event("spotify-player-error"));
  });

  player.addListener("account_error", ({ message }) => {
    console.error("Account error:", message);
    window.dispatchEvent(new Event("spotify-player-error"));
  });

  player.addListener("playback_error", ({ message }) => {
    console.error("Playback error:", message);
    window.dispatchEvent(new Event("spotify-player-error"));
  });

  // --- CONNECT PLAYER ---------------------------------------------------------

  player.connect().then(success => {
    if (success) {
      console.log("Web Playback SDK successfully connected.");
    } else {
      console.error("Web Playback SDK failed to connect.");
    }
  });
}

window.initializePlayer = initializePlayer;
