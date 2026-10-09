import { useState, useEffect } from "react";
import api, { setToken } from "./api/client";
import { Routes, Route, Link } from "react-router-dom";

import InteractionDetail from "./pages/InteractionDetail.jsx";
import ReferencePage from "./pages/ReferencePage.jsx";
import ItemDetail from "./pages/ItemDetail.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import OverrideEditor from "./pages/OverrideEditor.jsx";
import Login from "./pages/Login.jsx";
import Settings from "./pages/Settings.jsx";
import Profile from "./pages/Profile.jsx";

import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

function App() {
  const [token, setTokenState] = useState("");
  const [items, setItems] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [interactions, setInteractions] = useState([]);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    setTokenState(res.data.token);
    setToken(res.data.token);
  }

  async function loadItems() {
    const res = await api.get("/items");
    setItems(res.data);
  }

  async function loadSchedule() {
    const res = await api.get("/schedule", {
      params: { from: "2026-10-10", to: "2026-10-17" }
    });
    setSchedule(res.data.schedule);
  }

  async function loadInteractions() {
    const res = await api.get("/interactions");
    setInteractions(res.data.interactions);
  }

  useEffect(() => {
    if (token) {
      loadItems();
      loadSchedule();
      loadInteractions();
    }
  }, [token]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
        <Routes>
          {!token && (
            <Route path="*" element={<Login onLogin={login} />} />
          )}

          {token && (
            <Route
              path="*"
              element={
                <Layout>
                  <Routes>
                    {/* Dashboard */}
                    <Route
                      path="/"
                      element={
                        <div className="p-6 space-y-10">
                          <div>
                            <h1 className="text-3xl font-bold mb-4">
                              Dashboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300">
                              Overview of your current regimen.
                            </p>
                          </div>

                          <div>
                            <h2 className="text-2xl font-semibold mb-3">Items</h2>
                            <ul className="space-y-2">
                              {items.map(i => (
                                <li key={i.id}>
                                  <Link
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                    to={`/items/${i.id}`}
                                  >
                                    {i.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h2 className="text-2xl font-semibold mb-3">Schedule</h2>
                            <Link
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                              to="/calendar"
                            >
                              View Calendar
                            </Link>
                          </div>

                          <div>
                            <h2 className="text-2xl font-semibold mb-3">Interactions</h2>
                            <ul className="space-y-2">
                              {interactions.map(i => (
                                <li key={i.item_id}>
                                  <Link
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                    to={`/interactions/${i.item_id}`}
                                  >
                                    {i.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      }
                    />

                    <Route
                      path="/items/:itemId"
                      element={
                        <ProtectedRoute token={token}>
                          <ItemDetail />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/interactions/:itemId"
                      element={
                        <ProtectedRoute token={token}>
                          <InteractionDetail />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/reference/:itemId"
                      element={
                        <ProtectedRoute token={token}>
                          <ReferencePage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/calendar"
                      element={
                        <ProtectedRoute token={token}>
                          <CalendarPage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/override/:itemId"
                      element={
                        <ProtectedRoute token={token}>
                          <OverrideEditor />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute token={token}>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute token={token}>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Layout>
              }
            />
          )}
        </Routes>
      </div>
    </ToastProvider>
  );
}

export default App;
