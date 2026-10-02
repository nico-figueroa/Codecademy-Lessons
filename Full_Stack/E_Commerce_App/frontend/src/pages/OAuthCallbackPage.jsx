import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Alert from "../components/Alert.jsx";

// The backend finishes the GitHub OAuth flow with a full-page redirect to
// `${FRONTEND_URL}/oauth/callback#token=<jwt>` (success) or
// `#error=<message>` (failure). Values live in the URL *hash fragment* (not
// query params) so the token never reaches the backend's access logs.
export default function OAuthCallbackPage() {
  const { applyToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const hash = new URLSearchParams(window.location.hash.slice(1));
    const token = hash.get("token");
    const oauthError = hash.get("error");

    // Clear the sensitive fragment from the address bar immediately.
    window.history.replaceState(null, "", window.location.pathname);

    if (oauthError) {
      navigate(`/login?oauthError=${encodeURIComponent(oauthError)}`, {
        replace: true,
      });
      return;
    }

    if (!token) {
      setError("No authentication token was returned by GitHub.");
      return;
    }

    applyToken(token)
      .then(() => navigate("/", { replace: true }))
      .catch(() => setError("Failed to complete sign-in. Please try again."));
  }, [applyToken, navigate]);

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-0">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return <LoadingSpinner label="Finishing GitHub sign-in…" />;
}
