import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

// The backend redirects here with `#error=<message>` when GitHub sign-in
// fails. Successful sign-ins go to /oauth/confirm instead.
export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const hash = new URLSearchParams(window.location.hash.slice(1));
    const message = hash.get("error") || "GitHub sign-in could not be completed.";
    window.history.replaceState(null, "", window.location.pathname);
    navigate(`/login?oauthError=${encodeURIComponent(message)}`, { replace: true });
  }, [navigate]);

  return <LoadingSpinner label="Finishing GitHub sign-in…" />;
}
