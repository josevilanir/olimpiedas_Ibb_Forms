import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { api, setUnauthorizedHandler } from "../services/api";

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  initializing: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = "ibb_admin_token";
const USER_KEY = "ibb_admin_user";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AdminUser | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? (JSON.parse(stored) as AdminUser) : null;
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(!!token);

  useEffect(() => {
    if (token) {
      api.admin.getMe(token)
        .catch(() => {})
        .finally(() => setInitializing(false));
    }
  }, []); // Only on mount

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.admin.login(email, password);
      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.admin));
      setToken(result.token);
      setUser(result.admin);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(() => {});
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, initializing, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}
