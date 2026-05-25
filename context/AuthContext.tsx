"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { normalizeAuthToken } from "@/lib/api-client";
import {
  authService,
  getOptionalAuthResponseToken,
  getAuthResponseToken,
  getAuthResponseUser,
} from "@/services/auth-service";
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  GoogleAuthRequest,
  UpdateUserRequest,
} from "@/types";

function getJwtSubject(token: string | null): string {
  if (!token || typeof window === "undefined") return "";

  try {
    const payload = token.split(".")[1];
    if (!payload) return "";

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalized));
    return typeof decoded.sub === "string" ? decoded.sub : "";
  } catch {
    return "";
  }
}

function withSessionEmail(user: User, token: string | null): User {
  if (user.email) return user;
  const email = getJwtSubject(token);
  return email ? { ...user, email } : user;
}

type AuthCtx = {
  user: User | null;
  token: string | null; // NYTT: Exponera token för att fixa TypeScript-fel
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<User>;
  googleLogin: (data: GoogleAuthRequest) => Promise<User>;
  googleRegister: (data: GoogleAuthRequest) => Promise<User>;
  completeAuth: (response: AuthResponse) => User;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>; 
  updateUser: (data: UpdateUserRequest) => Promise<User>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // NYTT: State för att lagra token
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initiera vid start
  useEffect(() => {
    const initAuth = async () => {
      const storedToken =
        typeof window !== "undefined"
          ? normalizeAuthToken(localStorage.getItem("token"))
          : null;
      
      if (!storedToken) {
        localStorage.removeItem("token");
        setIsLoading(false);
        return;
      }

      try {
        localStorage.setItem("token", storedToken);
        setToken(storedToken); // Synka state med localStorage
        const session = await authService.session(storedToken);
        const accessToken = getOptionalAuthResponseToken(session) ?? storedToken;
        const userData = withSessionEmail(getAuthResponseUser(session), accessToken);
        localStorage.setItem("token", accessToken);
        setToken(accessToken);
        setUser(userData);
      } catch (error) {
        console.error("Token ogiltig", error);
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const applyAuthResponse = useCallback((res: AuthResponse) => {
    const accessToken = getAuthResponseToken(res);
    const userData = withSessionEmail(getAuthResponseUser(res), accessToken);
    localStorage.setItem("token", accessToken);
    setToken(accessToken);
    setUser(userData);
    return userData;
  }, []);

  // 2. Login
  const login = async (data: LoginRequest) => {
    const res = await authService.login(data);
    return applyAuthResponse(res);
  };

  const googleLogin = async (data: GoogleAuthRequest) => {
    const res = await authService.googleLogin(data);
    return applyAuthResponse(res);
  };

  const googleRegister = async (data: GoogleAuthRequest) => {
    await authService.googleRegister(data);
    const res = await authService.googleLogin(data);
    return applyAuthResponse(res);
  };

  // 3. Register
  const register = async (data: RegisterRequest) => {
    const res = await authService.register(data);
    if ("authRef" in res) {
      throw new Error("Studentregistrering behöver verifieras med Freja först.");
    }
    if (!("user" in res)) {
      throw new Error("Studentregistreringen behöver kompletteras med personuppgifter.");
    }

    return applyAuthResponse(res);
  };

  // 4. Logout
  const logout = () => {
    authService.logout();
    setToken(null); // Rensa state vid utloggning
    setUser(null);
  };

  // 5. Refresh (Hämta om användaren från servern)
  const refreshUser = async () => {
    try {
      const session = await authService.session();
      const accessToken =
        getOptionalAuthResponseToken(session) ??
        normalizeAuthToken(localStorage.getItem("token"));
      const updatedUser = withSessionEmail(getAuthResponseUser(session), accessToken);
      if (accessToken) {
        localStorage.setItem("token", accessToken);
        setToken(accessToken);
      }
      setUser(updatedUser);
    } catch (error) {
      console.error("Kunde inte uppdatera användare", error);
    }
  };

  // 6. Update (Skicka ny data till servern)
  const updateUser = async (data: UpdateUserRequest) => {
    const updatedUser = await authService.updateProfile(data);
    const normalizedUser = withSessionEmail(updatedUser, token);
    setUser(normalizedUser);
    return normalizedUser;
  };

  return (
    <Ctx.Provider value={{ 
      user, 
      token, // Skickas nu med i context-värdet
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      googleLogin,
      googleRegister,
      completeAuth: applyAuthResponse,
      register, 
      logout, 
      refreshUser,
      updateUser 
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
