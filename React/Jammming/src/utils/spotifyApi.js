export async function search(term) {
  const cleaned = term.trim();
  if (!cleaned) return [];

  let token = localStorage.getItem('access_token');
  
  const encoded = encodeURIComponent(cleaned);
  
  const response = await fetch(`https://api.spotify.com/v1/search?q=${encoded}&type=track`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  console.log("Search Results:", data);
  const tracks = data.tracks?.items || [];

  return tracks.map(track => ({
    id: track.id,
    name: track.name,
    artist: track.artists[0].name,
    album: track.album.name,
    uri: track.uri,
  }));
}

export async function createPlaylist(name, trackUris) {
  let token = localStorage.getItem('access_token');

  // Get user profile
  const profileRes = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const profile = await profileRes.json();
  console.log("User Profile:", profile);

  // Create playlist
  const playlistRes = await fetch(
    `https://api.spotify.com/v1/me/playlists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        description: "Created with Jammming",
      }),
    }
  );

  const playlist = await playlistRes.json();
  console.log("Created Playlist:", playlist);

  // Add tracks
  await fetch(
    `https://api.spotify.com/v1/playlists/${playlist.id}/items`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: trackUris,
      }),
    }
  );

  return playlist;
}
