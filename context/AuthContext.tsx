"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import {
  type User,
  type UserType,
  type StudentAccount,
  type CompanyAccount,
  type PrivateLandlordAccount,
} from '@/types';

type AuthCtx = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  ready: boolean;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

type ApiUserResponse = {
  id: number;
  email: string;
  createdAt?: string;
  accountType?: UserType | string;
  type?: UserType;
  displayName?: string;
  firstName?: string;
  surname?: string;
  ssn?: string | null;
  schoolId?: number | null;
  schoolName?: string | null;
  phone?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  orgNumber?: string | null;
  website?: string | null;
  city?: string | null;
  subtitle?: string | null;
  description?: string | null;
  verified?: boolean;
  verifiedStudent?: boolean;
  subscription?: string | null;
  rating?: number | null;
  tags?: string[] | null;
};

type ApiLoginResponse = {
  accessToken: string;
  user: ApiUserResponse;
};

const mapStudent = (u: ApiUserResponse): StudentAccount => ({
  studentId: u.id,
  type: "student",
  email: u.email,
  passwordHash: "",
  createdAt: u.createdAt ?? new Date().toISOString(),
  phone: u.phone ?? null,
  logoUrl: u.logoUrl ?? null,
  bannerUrl: u.bannerUrl ?? null,
  tags: u.tags ?? null,
  settings: null,
  firstName: u.firstName ?? u.displayName ?? u.email.split("@")[0],
  surname: u.surname ?? "",
  ssn: u.ssn ?? null,
  schoolId: u.schoolId ?? null,
  aboutText: null,
  gender: null,
  preferenceText: null,
  city: u.city ?? null,
  verifiedStudent: u.verifiedStudent ?? false,
});

const mapCompany = (u: ApiUserResponse): CompanyAccount => ({
  companyId: u.id,
  type: "company",
  email: u.email,
  passwordHash: "",
  createdAt: u.createdAt ?? new Date().toISOString(),
  phone: u.phone ?? null,
  logoUrl: u.logoUrl ?? null,
  bannerUrl: u.bannerUrl ?? null,
  tags: u.tags ?? null,
  settings: null,
  name: u.displayName ?? u.email.split("@")[0],
  orgNumber: u.orgNumber ?? null,
  city: u.city ?? null,
  website: u.website ?? null,
  rating: u.rating ?? null,
  subtitle: u.subtitle ?? null,
  description: u.description ?? null,
  contactEmail: u.contactEmail ?? null,
  contactPhone: u.contactPhone ?? null,
  contactNote: null,
  verified: u.verified ?? false,
});

const mapLandlord = (u: ApiUserResponse): PrivateLandlordAccount => ({
  landlordId: u.id,
  type: "private_landlord",
  email: u.email,
  passwordHash: "",
  createdAt: u.createdAt ?? new Date().toISOString(),
  phone: u.phone ?? null,
  logoUrl: u.logoUrl ?? null,
  bannerUrl: u.bannerUrl ?? null,
  tags: u.tags ?? null,
  settings: null,
  fullName: u.displayName ?? u.email.split("@")[0],
  ssn: u.ssn ?? null,
  subscription: u.subscription ?? null,
  rating: u.rating ?? null,
  description: u.description ?? null,
  contactEmail: u.contactEmail ?? null,
  contactPhone: u.contactPhone ?? null,
  contactNote: null,
  verified: u.verified ?? false,
});

const mapUser = (u: ApiUserResponse): User => {
  const userType = (u.accountType ?? u.type ?? "student") as UserType;
  if (userType === "company") return mapCompany(u);
  if (userType === "private_landlord") return mapLandlord(u);
  return mapStudent(u);
};

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
    apiFetch<ApiUserResponse>("/api/auth/me", {}, t)
      .then((u) => setUser(mapUser(u)))
      .catch(() => {
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);


  const login = async (email: string, password: string) => {
    const res = await apiFetch<ApiLoginResponse>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );
    localStorage.setItem('auth_token', res.accessToken);
    setToken(res.accessToken);
    setUser(mapUser(res.user as unknown as ApiUserResponse));
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
