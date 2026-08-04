import React, { useEffect, useState } from "react";
import { getUserPlaylists } from "../../utils/spotifyApi";
import "./UserPlaylists.css";

export default function UserPlaylists({ onSelect }) {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const items = await getUserPlaylists();
        setPlaylists(items || []);
      } catch (err) {
        console.error("Failed to load playlists:", err);
        setPlaylists([]);
      }
    }

    load();
  }, []);

  return (
    <div className="UserPlaylists">
      <h2>Your Current Playlists</h2>

      <div className="playlist-grid">
        {playlists.map(playlist => (
          <div
            key={playlist.id}
            className="playlist-card"
            onClick={() => onSelect(playlist.id)}
          >
            {playlist.image && <img src={playlist.image} alt={playlist.name} />}
            <p>{`Playlist Name: ${playlist.name}`}</p>
            <p>{`${playlist.total} tracks`}</p>
            <p>{`Owner: ${playlist.owner}`}</p>
            <p>{`Description: ${playlist.description}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
