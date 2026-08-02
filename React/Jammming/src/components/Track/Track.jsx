// src/components/Track/Track.jsx
import React from 'react';

export default function Track({ track, onAddTrack, onRemoveTrack, editing }) {
  return (
    <div className="Track">
      <h3>{track.name}</h3>
      <p>{track.artist} — {track.album}</p>

      {onAddTrack && (
        <button onClick={() => onAddTrack(track)} disabled={editing}>
          +
        </button>
      )}

      {onRemoveTrack && (
        <button onClick={() => onRemoveTrack(track)} disabled={editing}>
          -
        </button>
      )}
    </div>
  );
}

