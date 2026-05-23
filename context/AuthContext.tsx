"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { normalizeAuthToken } from "@/lib/api-client";
import {
  authService,
  getOptionalAuthResponseToken,
  getAuthResponseToken,
  getAuthResponseUser,
} from "@/services/auth-service";
import {
  User,
  LoginRequest,
  RegisterRequest,
  GoogleAuthRequest,
  UpdateUserRequest,
} from "@/types";

type AuthCtx = {
  user: User | null;
  token: string | null; // NYTT: Exponera token för att fixa TypeScript-fel
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<User>;
  googleLogin: (data: GoogleAuthRequest) => Promise<User>;
  googleRegister: (data: GoogleAuthRequest) => Promise<User>;
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
        const userData = getAuthResponseUser(session);
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

  const applyAuthResponse = async (res: Awaited<ReturnType<typeof authService.login>>) => {
    const accessToken = getAuthResponseToken(res);
    const userData = getAuthResponseUser(res);
    localStorage.setItem("token", accessToken);
    setToken(accessToken);
    setUser(userData);
    return userData;
  };

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
    const res = await authService.googleRegister(data);
    return applyAuthResponse(res);
  };

  // 3. Register
  const register = async (data: RegisterRequest) => {
    const res = await authService.register(data);
    if ("authRef" in res) {
      throw new Error("Studentregistrering behöver verifieras med Freja först.");
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
      const updatedUser = getAuthResponseUser(session);
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
    setUser(updatedUser);
    return updatedUser;
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

