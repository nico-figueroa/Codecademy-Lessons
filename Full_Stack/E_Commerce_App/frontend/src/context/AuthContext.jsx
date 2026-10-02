import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  fetchCurrentUser,
  login as apiLogin,
  register as apiRegister,
} from "../api/auth.js";
import { getStoredToken, setStoredToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrate = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const me = await fetchCurrentUser();
      setUser(me);
    } catch {
      // Token missing/expired/invalid - clear it so the app treats the
      // visitor as signed out instead of looping on failed requests.
      setStoredToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Stores a freshly issued token and (re)loads the profile it belongs to.
  const applyToken = useCallback(
    async (accessToken) => {
      setStoredToken(accessToken);
      setIsLoading(true);
      await hydrate();
    },
    [hydrate],
  );

  const login = useCallback(
    async (credentials) => {
      const { accessToken } = await apiLogin(credentials);
      await applyToken(accessToken);
    },
    [applyToken],
  );

  const register = useCallback(async (credentials) => {
    await apiRegister(credentials);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await fetchCurrentUser();
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      applyToken,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, applyToken, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
