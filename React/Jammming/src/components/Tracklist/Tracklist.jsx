// src/components/Tracklist/Tracklist.jsx
import React from 'react';
import Track from '../Track/Track';
import "./Tracklist.css";

export default function Tracklist({ tracks, onAddTrack, onRemoveTrack, editing, /*deviceId*/ }) {
  console.log("Executed Tracklist.jsx")

  return (
    <div className="Tracklist">
      {tracks.map(track => (
        <Track
          key={track.id}
          track={track}
          onAddTrack={onAddTrack}
          onRemoveTrack={onRemoveTrack}
          editing={editing}
          /*deviceId={deviceId}*/
        />
      ))}
    </div>
  );
}

