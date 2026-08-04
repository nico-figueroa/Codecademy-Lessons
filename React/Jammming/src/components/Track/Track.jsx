import React from "react";
import "./Track.css";
import { playTrack } from "../../utils/spotifyApi";

export default function Track({ track, onAddTrack, onRemoveTrack, editing, deviceId }) {
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
          onClick={() => playTrack(track.uri, deviceId)}
          >
            Play ▶
        </button>
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
