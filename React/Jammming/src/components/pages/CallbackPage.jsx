import { useEffect } from "react";
import { getAccessToken } from "../../hooks/useSpotifyAuth";
import { useNavigate } from "react-router-dom";

export default function CallbackPage() {
  console.log("Executed CallbackPage.jsx")
  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    async function handleAuth() {
      const token = await getAccessToken();

      if (!isActive) {
        return;
      }

      if (token) {
        navigate("/", { replace: true });
      }
    }

    handleAuth();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  return (
    <div>
      <h2>Connecting to Spotify…</h2>
      <p>Please wait while we complete authentication.</p>
    </div>
  );
}
