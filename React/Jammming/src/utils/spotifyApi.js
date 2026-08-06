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
    image: track.album.images?.[1]?.url || track.album.images?.[0]?.url || ""
  }));
}

export async function createPlaylist(name, trackUris) {
  let token = localStorage.getItem('access_token');

  // Get user profile
  const profileRes = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const profile = await profileRes.json();
  // console.log("User Profile:", profile);

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
  // console.log("Created Playlist:", playlist);

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

  console.log("Executed createPlaylist function")
  return playlist;
}

export async function playTrack(uri, deviceId) {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error("No Spotify access token available.");
  }

  if (!deviceId) {
    throw new Error("No Spotify Web Playback device is ready.");
  }

  await fetch("https://api.spotify.com/v1/me/player", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      device_ids: [deviceId],
      play: false,
    }),
  });

  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uris: [uri],
    }),
  });
}

export async function getUserPlaylists() {
  let token = localStorage.getItem('access_token');
     
  const response = await fetch(`https://api.spotify.com/v1/me/playlists`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Playlist fetch failed:", response.status, errorBody);
    return [];
  }

  const data = await response.json();
  if (!data.items) {
    console.warn("No playlist items in response:", data);
    return [];
  }

  console.log("Executed getUserPlaylists:", data.items);

  return data.items.map(playlist => ({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    image: playlist.images?.[0]?.url || "",
    tracksHref: playlist.items.href,
    total: playlist.items.total,
    owner: playlist.owner.display_name,
  }));
}

