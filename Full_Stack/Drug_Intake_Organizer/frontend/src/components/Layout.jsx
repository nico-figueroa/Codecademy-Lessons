import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "./ui/Button.jsx";

export default function Layout({ children }) {
  const [dark, setDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") setDark(true);
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const navItems = [
    { to: "/", label: "Dashboard" },
    { to: "/items/1", label: "Items" }, // example link
    { to: "/calendar", label: "Calendar" },
    { to: "/interactions/1", label: "Interactions" }, // example link
    { to: "/settings", label: "Settings" },
    { to: "/profile", label: "Profile" },
  ];

  return (
    <div className={`min-h-screen ${dark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"} transition-colors duration-300`}>
      <header className="border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-lg">Drug Intake Organizer</span>
          <nav className="flex gap-4">
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-medium ${
                  location.pathname === item.to
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300"
                } hover:underline`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setDark(d => !d)}
            >
              {dark ? "Light" : "Dark"}
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
