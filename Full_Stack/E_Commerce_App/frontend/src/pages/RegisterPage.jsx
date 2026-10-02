import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Alert from "../components/Alert.jsx";

export default function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ email, password });
      // Registration doesn't return a token, so log in immediately with the
      // same credentials for a seamless sign-up -> signed-in experience.
      await login({ email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:px-0">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Sign up with an email and password, or use GitHub from the login page.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <form
        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500"
          />
          <p className="mt-1 text-xs text-slate-400">At least 8 characters.</p>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-indigo-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
