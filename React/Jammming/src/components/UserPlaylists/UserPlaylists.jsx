import React, { useEffect, useState } from "react";
import { getUserPlaylists } from "../../utils/spotifyApi";
import "./UserPlaylists.css";
import { useParams } from "react-router-dom";

export default function UserPlaylists({ onSelect }) {
  console.log("Executed UserPlaylists.jsx")
  
  const [playlists, setPlaylists] = useState([]);
  const { owner } = useParams();

  useEffect(() => {
    async function load() {
      try {
        const items = await getUserPlaylists();

        const filtered = owner
        ? items.filter(p =>
          p.owner.toLowerCase().includes(owner.toLowerCase())
        )
        : items;
        
        console.log("Filtered", filtered);
        setPlaylists(filtered || []);
      } catch (err) {
        console.error("Failed to load playlists:", err);
        setPlaylists([]);
      }
    }

    load();
  }, [owner]);

  return (
    <div className="UserPlaylists">
      <h2>{owner ? `Playlists owned by ${owner}` : "Your Current Playlists"}</h2>

      <div className="playlist-grid">
        {playlists.map(playlist => (
          <div
            key={playlist.id}
            className="playlist-card"
            onClick={() => onSelect?.(playlist.id)}
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
