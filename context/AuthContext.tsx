"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { normalizeAuthToken } from "@/lib/api-client";
import { authService, getAuthResponseToken } from "@/services/auth-service";
import { User, LoginRequest, RegisterRequest, UpdateUserRequest } from "@/types";

type AuthCtx = {
  user: User | null;
  token: string | null; // NYTT: Exponera token för att fixa TypeScript-fel
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>; 
  updateUser: (data: UpdateUserRequest) => Promise<void>;
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
        const userData = await authService.me(storedToken);
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

  // 2. Login
  const login = async (data: LoginRequest) => {
    const res = await authService.login(data);
    const accessToken = getAuthResponseToken(res);
    const userData = await authService.me(accessToken);
    localStorage.setItem("token", accessToken);
    setToken(accessToken); // Uppdatera token vid inloggning
    setUser(userData);
    return userData;
  };

  // 3. Register
  const register = async (data: RegisterRequest) => {
    const res = await authService.register(data);
    if ("authRef" in res) {
      throw new Error("Studentregistrering behöver verifieras med Freja först.");
    }

    const accessToken = getAuthResponseToken(res);
    const userData = await authService.me(accessToken);
    localStorage.setItem("token", accessToken);
    setToken(accessToken); // Uppdatera token vid registrering
    setUser(userData);
    return userData;
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
      const updatedUser = await authService.me();
      setUser(updatedUser);
    } catch (error) {
      console.error("Kunde inte uppdatera användare", error);
    }
  };

  // 6. Update (Skicka ny data till servern)
  const updateUser = async (data: UpdateUserRequest) => {
    const updatedUser = await authService.updateProfile(data);
    setUser(updatedUser);
  };

  return (
    <Ctx.Provider value={{ 
      user, 
      token, // Skickas nu med i context-värdet
      isAuthenticated: !!user, 
      isLoading, 
      login, 
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

