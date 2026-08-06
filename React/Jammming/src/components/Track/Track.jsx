import React, { useEffect, useState } from "react";
import "./Track.css";
import { playTrack } from "../../utils/spotifyApi";

export default function Track({ track, onAddTrack, onRemoveTrack, editing }) {
  console.log("Executed Track.jsx")

  const [deviceId, setDeviceId] = useState(() => localStorage.getItem("spotify_device_id") || "");
  const [playerError, setPlayerError] = useState("");

  useEffect(() => {
    const syncDeviceId = () => {
      setDeviceId(localStorage.getItem("spotify_device_id") || "");
    };

    const handlePlayerError = () => {
      setPlayerError("Spotify playback is unavailable in this browser preview. Try in a regular browser window.");
    };

    syncDeviceId();

    const token = localStorage.getItem("access_token");
    if (!deviceId && token && typeof window.initializePlayer === "function") {
      window.initializePlayer(token);
    }

    window.addEventListener("spotify-device-ready", syncDeviceId);
    window.addEventListener("spotify-player-error", handlePlayerError);

    return () => {
      window.removeEventListener("spotify-device-ready", syncDeviceId);
      window.removeEventListener("spotify-player-error", handlePlayerError);
    };
  }, [deviceId]);

  return (
    <div className="Track">
      {track.image && (
        <img src={track.image} alt={track.name} className="track-image" />
      )}
      <div className="track-info">
        <h3>{track.name}</h3>
        <p>{track.artist} — {track.album}</p>
      </div>

      <div className="track-preview">
        <button
          className="round-btn play-btn"
          onClick={() => {
            if (!deviceId) {
              setPlayerError("Spotify playback is unavailable in this browser preview. Try in a regular browser window.");
              return;
            }
            playTrack(track.uri, deviceId);
          }}
        >
          Play ▶
        </button>
        {playerError && <p className="track-error">{playerError}</p>}
      </div>
      
      <div className="track-buttons">
        {onAddTrack && (
          <button
            className="round-btn add-btn"
            onClick={() => onAddTrack(track)}
            disabled={editing}
          >
            +
          </button>
        )}
        {onRemoveTrack && (
          <button
            className="round-btn remove-btn"
            onClick={() => onRemoveTrack(track)}
            disabled={editing}
          >
            −
          </button>
        )}
      </div>
    </div>
  );
}
