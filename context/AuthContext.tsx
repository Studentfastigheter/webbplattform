"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/auth-service";
import { User, LoginRequest, RegisterRequest, UpdateUserRequest } from "@/types";

type AuthCtx = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Ersätter 'ready' för tydlighet
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>; 
  updateUser: (data: UpdateUserRequest) => Promise<void>; // För onboarding
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initiera vid start
  useEffect(() => {
    const initAuth = async () => {
      // Vi kollar bara om token finns, api-client sköter headern
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authService.me();
        setUser(userData);
      } catch (error) {
        console.error("Token ogiltig", error);
        localStorage.removeItem("token"); // Rensa om den är trasig
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
    // Spara token så api-client hittar den nästa gång
    localStorage.setItem("token", res.accessToken);
    setUser(res.user);
  };

  // 3. Register
  const register = async (data: RegisterRequest) => {
    const res = await authService.register(data);
    localStorage.setItem("token", res.accessToken);
    setUser(res.user);
  };

  // 4. Logout
  const logout = () => {
    authService.logout(); // Rensar localStorage
    setUser(null);
    // Valfritt: window.location.href = "/";
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