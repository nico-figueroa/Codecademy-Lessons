// src/components/App/App.jsx
import React, { useState, useEffect } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import { search, createPlaylist } from "../../utils/spotifyApi";
import { getAccessToken } from "../../hooks/useSpotifyAuth";

let hasFetchedToken = false;

export default function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState("New Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [editing, setEditing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  useEffect(() => {
    if (!hasFetchedToken) {
      hasFetchedToken = true;
      getAccessToken();
    }
  }, []);

  async function handleSearch(term) {
    setHasSearched(true);
    const results = await search(term);
    setSearchResults(results);
  }

  function addTrack(track) {
    if (!playlistTracks.find(t => t.id === track.id)) {
      setPlaylistTracks(prev => [...prev, track]);
    }
  }

  function removeTrack(track) {
    setPlaylistTracks(prev => prev.filter(t => t.id !== track.id));
  }

  async function savePlaylist() {
    if (!playlistTracks.length) {
      console.log("No tracks to save.");
      return;
    }

    const trackUris = playlistTracks.map(track => track.uri);
    console.log("Saving playlist with URIs:", trackUris);

    try {
      const playlist = await createPlaylist(playlistName, trackUris);

      if (!playlist || !playlist.id) {
        console.error("Playlist creation failed:", playlist);
        return;
      }

      console.log("Playlist saved successfully!", playlist);

      // Reset playlist UI
      setPlaylistName("New Playlist");
      setPlaylistTracks([]);

    } catch (error) {
      console.error("Error saving playlist:", error);
    }
  }


  return (
    <div className="App">
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
      />
    </div>
  );
}
