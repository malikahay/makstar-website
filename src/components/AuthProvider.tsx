"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, type User } from "@/lib/client";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; password: string; name: string; phone: string }) => Promise<User>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<User>("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await api<User>("/auth/login", { email, password });
    setUser(u);
    return u;
  }, []);

  const register = useCallback<AuthCtx["register"]>(async (data) => {
    const u = await api<User>("/auth/register", data);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await api("/auth/logout", {});
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
