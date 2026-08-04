// src/utils/spotifyPlayer.js

export function initializePlayer(token) {
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

    // Do NOT resume here — browser gesture required
  });

  player.addListener("not_ready", ({ device_id }) => {
    console.warn("Device ID has gone offline", device_id);
  });

  player.addListener("initialization_error", ({ message }) =>
    console.error("Failed to initialize player:", message)
  );

  player.addListener("authentication_error", ({ message }) =>
    console.error("Authentication error:", message)
  );

  player.addListener("account_error", ({ message }) =>
    console.error("Account error:", message)
  );

  player.addListener("playback_error", ({ message }) =>
    console.error("Playback error:", message)
  );

  // --- REQUIRED: USER GESTURE TO UNLOCK AUDIO --------------------------------

  // This ensures autoplay rules are satisfied AND primes the device
  const unlockAndPrime = async () => {
    try {
      await player.activateElement();   // unlock audio
      await player.resume();            // REQUIRED: makes device ACTIVE
      console.log("Web Playback SDK activated and primed.");
    } catch (err) {
      console.error("Failed to activate player:", err);
    }
  };

  // Only run once
  const gestureHandler = () => {
    unlockAndPrime();
    document.removeEventListener("click", gestureHandler);
  };

  document.addEventListener("click", gestureHandler);

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
