"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/auth-service";
import { User, LoginRequest, RegisterRequest, UpdateUserRequest } from "@/types";

type AuthCtx = {
  user: User | null;
  token: string | null; // NYTT: Exponera token för att fixa TypeScript-fel
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
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
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        setToken(storedToken); // Synka state med localStorage
        const userData = await authService.me();
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
    localStorage.setItem("token", res.accessToken);
    setToken(res.accessToken); // Uppdatera token vid inloggning
    setUser(res.user);
  };

  // 3. Register
  const register = async (data: RegisterRequest) => {
    const res = await authService.register(data);
    localStorage.setItem("token", res.accessToken);
    setToken(res.accessToken); // Uppdatera token vid registrering
    setUser(res.user);
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