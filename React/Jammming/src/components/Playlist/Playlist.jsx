// src/components/Playlist/Playlist.jsx
import React, { useState } from 'react';
import Tracklist from '../Tracklist/Tracklist';
import "./Playlist.css";

export default function Playlist({
    playlistName,
    playlistTracks,
    onNameChange,
    onAddTrack,
    onRemoveTrack,
    onSave,
    editing,
    setEditing
  }) {

  console.log("Executed Playlist.jsx")

  return (
    <div className="Playlist">
      {editing ? (
        <input
          value={playlistName}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setEditing(false);
            }
          }}
          onBlur={() => setEditing(false)}
          autoFocus
        />
      ) : (
        <h2 onClick={() => setEditing(true)}>
          {playlistName}
        </h2>
      )}

      <p>
        {playlistTracks.length} {playlistTracks.length === 1 ? "track" : "tracks"}
      </p>

      <Tracklist
        tracks={playlistTracks}
        onAddTrack={onAddTrack}
        onRemoveTrack={onRemoveTrack}
        editing={editing}
      />

      <button onClick={onSave}>
        Save to Spotify
      </button>
    </div>
  );
}

