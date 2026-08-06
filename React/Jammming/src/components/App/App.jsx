// src/components/App/App.jsx
import { useEffect } from "react";
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import Root from "../pages/Root";
import Home from "../pages/Home";
import UserPlaylistsPage from "../pages/UserPlaylistsPage";
import CallbackPage from "../pages/CallbackPage";

function clearSpotifySessionState() {
  const keysToRemove = [
    "access_token",
    "refresh_token",
    "code_verifier",
    "spotify_device_id",
  ];

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

function startFreshSpotifySession() {
  clearSpotifySessionState();
  window.location.replace("/callback");
}

export default function App() {
  console.log("Executed App.jsx")
  const owner = 'Nicolas Figueroa Hidalgo';

  useEffect(() => {
    const hasAuthCode = new URLSearchParams(window.location.search).get("code");
    const isCallbackRoute = window.location.pathname === "/callback";

    if (!hasAuthCode && !isCallbackRoute) {
      startFreshSpotifySession();
      return;
    }

    if (hasAuthCode && typeof window.initializePlayer === "function") {
      window.initializePlayer(localStorage.getItem("access_token"));
    }
  }, []);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Root />}>
        <Route index element={<Home />} />
        <Route path={`playlists/:${owner}`} element={<UserPlaylistsPage />} />
        <Route path="callback" element={<CallbackPage />} />
      </Route>
    ),
    {
      future: {
        v7_startTransition: true
      }
    }
  );

  return <RouterProvider router={router} />;
}
