// src/components/pages/Home.jsx
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import SearchResults from "../SearchResults/SearchResults";
import Playlist from "../Playlist/Playlist";
import Alert from "../Alert/Alert";
import { MessageContext } from "../../context/MessageContext";
import { search, createPlaylist } from "../../utils/spotifyApi";
import "../App/App.css";

// let hasFetchedToken = false;

export default function Home() {
  console.log("Executed Home.jsx")
  const owner = 'Nicolas Figueroa Hidalgo'
  
  const { message, showMessage } = useContext(MessageContext);

  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState("New Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [editing, setEditing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  // const [deviceId, setDeviceId] = useState(null);

  /* useEffect(() => {
    const id = localStorage.getItem("spotify_device_id");
    if (id) setDeviceId(id);
  }, []); */

  /* useEffect(() => {
    if (!hasFetchedToken) {
      hasFetchedToken = true;
      getAccessToken();
      console.log("Token requested through home")
    }
  }, []); */

  async function handleSearch(term) {
    setHasSearched(true);

    const results = await search(term);

    if (results.length === 0) {
      showMessage("error", "Search failed. Try again.");
    } else {
      showMessage("success", "Search completed!");
    }

    setSearchResults(results);
  }

  function addTrack(track) {
    if (!playlistTracks.find(t => t.id === track.id)) {
      setPlaylistTracks(prev => [...prev, track]);
    } else {
      showMessage("info", "Track is already in the playlist.");
    }
  }

  function removeTrack(track) {
    setPlaylistTracks(prev => prev.filter(t => t.id !== track.id));
  }

  async function savePlaylist() {
    if (!playlistTracks.length) {
      showMessage("error", "Failed to save playlist.");
      return;
    }

    const trackUris = playlistTracks.map(track => track.uri);

    try {
      await createPlaylist(playlistName, trackUris);
      showMessage("success", "Playlist saved to Spotify!");
      setPlaylistName("New Playlist");
      setPlaylistTracks([]);
    } catch {
      showMessage("error", "Failed to save playlist.");
    }
  }

  return (
    <div className="HomePage">
      
      <SearchBar onSearch={handleSearch} editing={editing} />

      <SearchResults
        searchResults={searchResults}
        onAddTrack={addTrack}
        editing={editing}
        hasSearched={hasSearched}
        /*deviceID={deviceId}*/
      />

      <Playlist
        playlistName={playlistName}
        playlistTracks={playlistTracks}
        onNameChange={setPlaylistName}
        onAddTrack={addTrack}
        onRemoveTrack={removeTrack}
        onSave={savePlaylist}
        editing={editing}
        setEditing={setEditing}
        /*deviceID={deviceId}*/
      />

    </div>
  );
}
