"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type UserType = "student" | "company" | "landlord"; 

type User = {
  id: number;
  type: UserType;
  ssn: string;
  email: string;
  createdAt: string;
  schoolId?: number | null;
  schoolName?: string | null;
};
type LoginResp = { accessToken: string; user: User };

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
    const t = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!t) { setReady(true); return; }
    setToken(t);
    apiFetch<User>('/api/auth/me', {}, t)
      .then(u => setUser(u))
      .catch(() => { localStorage.removeItem('auth_token'); setToken(null); setUser(null); })
      .finally(() => setReady(true));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiFetch<LoginResp>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );
    localStorage.setItem('auth_token', res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
  };

  const logout = () => {
    if (typeof window !== 'undefined') localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, token, login, logout, ready }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
