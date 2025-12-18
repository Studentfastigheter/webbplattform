"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// ÄNDRING: Importera authService istället för funktioner från api
import { authService } from "@/services/auth-service";
import { type User } from "@/types";

type AuthCtx = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  ready: boolean;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const t = localStorage.getItem("auth_token");
    if (!t) {
      setReady(true);
      return;
    }

    setToken(t);
    
    // ÄNDRING: Använd authService.me
    authService.me(t)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const login = async (email: string, password: string) => {
    // ÄNDRING: Använd authService.login
    const res = await authService.login({ email, password });
    localStorage.setItem("auth_token", res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
  };

  const logout = () => {
    if (typeof window !== "undefined") localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, token, login, logout, ready }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}