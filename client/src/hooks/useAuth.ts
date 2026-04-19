import { useState, useCallback } from "react";
import { UserProfile } from "../types/game";

const API_BASE = "/api/auth";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("da_token"));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem("da_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("da_token", data.token);
      localStorage.setItem("da_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      localStorage.setItem("da_token", data.token);
      localStorage.setItem("da_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("da_token");
    localStorage.removeItem("da_user");
    setToken(null);
    setUser(null);
  }, []);

  return { token, user, error, loading, login, register, logout };
}
