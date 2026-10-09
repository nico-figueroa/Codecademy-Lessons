import { useState } from "react";
import Button from "../components/ui/Button.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const { showToast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await onLogin(email, password);
      showToast("success", "Logged in successfully");
    } catch {
      setError("Invalid credentials");
      showToast("error", "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md animate-fade-in">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Drug Intake Organizer
        </h1>

        {error && (
          <p className="text-red-600 text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <Button variant="primary" type="submit" className="w-full">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
