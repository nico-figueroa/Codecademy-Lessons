import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";

// Wraps routes that require an authenticated session (cart, checkout, order
// history). Unauthenticated visitors are redirected to /login, remembering
// where they were headed so they can resume after signing in.
export default function ProtectedRoute({ adminOnly = false }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner label="Checking your session…" />;
  }

  if (!isAuthenticated) {
    const redirectTo = `${location.pathname}${location.search}`;
    return (
      <Navigate to={`/login?redirect=${encodeURIComponent(redirectTo)}`} replace />
    );
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
