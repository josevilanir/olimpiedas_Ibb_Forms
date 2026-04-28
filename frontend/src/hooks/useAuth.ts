import { useState, useCallback } from "react";
import { api } from "../services/api";

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

const TOKEN_KEY = "ibb_admin_token";
const USER_KEY = "ibb_admin_user";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AdminUser | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? (JSON.parse(stored) as AdminUser) : null;
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return { token, user, login, logout, error, loading, isAuthenticated: !!token };
}
