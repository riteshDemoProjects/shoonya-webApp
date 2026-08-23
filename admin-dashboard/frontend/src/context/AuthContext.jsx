import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { api, onUnauthorized, setAuthToken, getAuthToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email, password) => {
    const res = await api.login({ email, password });
    setAuthToken(res.access_token);
    const admin = await api.getMe();
    setAdmin(admin);
    return { ...res, admin };
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setAdmin(null);
  }, []);

  const fetchMe = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setAdmin(res);
    } catch {
      setAuthToken(null);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
    const off = onUnauthorized(() => {
      setAuthToken(null);
      setAdmin(null);
    });
    return off;
  }, [fetchMe]);

  return (
    <AuthContext.Provider
      value={{ admin, login, logout, loading, refetch: fetchMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
