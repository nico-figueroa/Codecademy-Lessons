// src/components/Tracklist/Tracklist.jsx
import React from 'react';
import Track from '../Track/Track';

export default function Tracklist({ tracks, onAddTrack, onRemoveTrack, editing }) {
  return (
    <div className="Tracklist">
      {tracks.map(track => (
        <Track
          key={track.id}
          track={track}
          onAddTrack={onAddTrack}
          onRemoveTrack={onRemoveTrack}
          editing={editing}
        />
      ))}
    </div>
  );
}

