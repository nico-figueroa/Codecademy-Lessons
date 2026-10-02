import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  confirmOAuth,
  discardOAuth,
  fetchPendingOAuth,
  githubOAuthSelectUrl,
} from "../api/auth.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Alert from "../components/Alert.jsx";

// After GitHub authenticates, the backend parks the result behind a
// single-use ticket (in the URL hash) so the user can confirm which account
// to continue with before a session is issued.
export default function OAuthConfirmPage() {
  const { applyToken } = useAuth();
  const navigate = useNavigate();
  const ticketRef = useRef(null);
  const hasRun = useRef(false);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const ticket = new URLSearchParams(window.location.hash.slice(1)).get("ticket");
    window.history.replaceState(null, "", window.location.pathname);
    if (!ticket) {
      setError("This sign-in link is missing or has expired. Please try again.");
      return;
    }
    ticketRef.current = ticket;
    fetchPendingOAuth(ticket)
      .then(setPending)
      .catch((err) => setError(err.message));
  }, []);

  async function handleContinue() {
    setIsBusy(true);
    setError(null);
    try {
      const { accessToken } = await confirmOAuth(ticketRef.current);
      await applyToken(accessToken);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
      setIsBusy(false);
    }
  }

  async function handleDifferent() {
    setIsBusy(true);
    try {
      await discardOAuth(ticketRef.current);
    } catch {
      // The ticket expires on its own; proceed regardless.
    }
    window.location.href = githubOAuthSelectUrl();
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-0">
        <Alert variant="error">{error}</Alert>
        <a href="/login" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline">
          Back to login
        </a>
      </div>
    );
  }

  if (!pending) return <LoadingSpinner label="Verifying GitHub sign-in…" />;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:px-0">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        {pending.avatarUrl && (
          <img src={pending.avatarUrl} alt="" className="mx-auto h-16 w-16 rounded-full" />
        )}
        <h1 className="font-display mt-4 text-xl font-bold text-slate-900">
          Continue as @{pending.githubLogin}?
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {pending.name ? `${pending.name} · ` : ""}
          {pending.email}
        </p>
        <button
          type="button"
          onClick={handleContinue}
          disabled={isBusy}
          className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          Continue as @{pending.githubLogin}
        </button>
        <button
          type="button"
          onClick={handleDifferent}
          disabled={isBusy}
          className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Use a different GitHub account
        </button>
        <p className="mt-4 text-xs text-slate-400">
          If GitHub does not show an account picker, sign out of github.com first.
        </p>
      </div>
    </div>
  );
}
