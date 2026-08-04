// src/components/App/App.jsx
import React, { useState, useEffect } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import { search, createPlaylist } from "../../utils/spotifyApi";
import { getAccessToken } from "../../hooks/useSpotifyAuth";
import "./App.css";
import Alert from "../Alert/Alert";
import { MessageContext } from "../../context/MessageContext";
import { useContext } from "react";
import UserPlaylists from '../UserPlaylists/UserPlaylists';

let hasFetchedToken = false;

export default function App() {
  const { message, showMessage } = useContext(MessageContext);

  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState("New Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [editing, setEditing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("spotify_device_id");
    if (id) {
      console.log("Loaded device ID from localStorage:", id);
      setDeviceId(id);
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedToken) {
      hasFetchedToken = true;
      getAccessToken();
    }
  }, []);

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
      console.log("No tracks to save.");
      showMessage("error", "Failed to save playlist.");
      return;
    }

    const trackUris = playlistTracks.map(track => track.uri);
    
    try {
      const playlist = await createPlaylist(playlistName, trackUris);

      if (!playlist || !playlist.id) {
        console.error("Playlist creation failed:", playlist);
        return;
      }

      showMessage("success", "Playlist saved to Spotify!");

      // Reset playlist UI
      setPlaylistName("New Playlist");
      setPlaylistTracks([]);

    } catch (error) {
      console.error("Error saving playlist:", error);
      showMessage("error", "Failed to save playlist.");
    }
  }

  async function handlePlaylistSelect(id) {
    const playlist = await getPlaylistDetails(id);
    setPlaylistName(playlist.name);
    setPlaylistTracks(playlist.items.map(tracks => tracks.track));
  }

  return (
    <div className="App">

      {message && <Alert type={message.type} text={message.text} />}

      <h1>Jammming</h1>
      <h2>(Spotify Edition)</h2>
      <SearchBar 
        onSearch={handleSearch} 
        editing={editing}
      />
      <SearchResults 
        searchResults={searchResults} 
        onAddTrack={addTrack}
        editing={editing}
        hasSearched={hasSearched}
        deviceId={deviceId}
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
        deviceId={deviceId}
      />
      <UserPlaylists onSelect={handlePlaylistSelect} />
    </div>
  );
}
