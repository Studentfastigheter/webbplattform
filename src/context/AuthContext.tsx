"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError, normalizeAuthToken } from "@/lib/api/client";
import { getStoredAuthToken, setStoredAuthToken } from "@/lib/auth-storage";
import {
  authService,
  getOptionalAuthResponseToken,
  getAuthResponseToken,
  getAuthResponseUser,
  normalizeAuthResponse,
} from "@/features/auth/services/auth-service";
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  GoogleAuthRequest,
  GoogleRegisterResponse,
  QuickRegisterResponse,
  UpdateUserRequest,
} from "@/types";

type AuthPayload = Partial<AuthResponse> & Record<string, unknown>;
type AuthInput =
  | AuthResponse
  | GoogleRegisterResponse
  | QuickRegisterResponse
  | AuthPayload;
type JwtPayload = {
  sub?: string;
  uid?: number | string;
  accountType?: string;
};

function getJwtPayload(token: string | null): JwtPayload {
  if (!token || typeof window === "undefined") return {};

  try {
    const payload = token.split(".")[1];
    if (!payload) return {};

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(normalized)) as JwtPayload;
  } catch {
    return {};
  }
}

function getJwtSubject(token: string | null): string {
  const payload = getJwtPayload(token);
  return typeof payload.sub === "string" ? payload.sub : "";
}

function withSessionEmail(user: User, token: string | null): User {
  if (user.email) return user;
  const email = getJwtSubject(token);
  return email ? { ...user, email } : user;
}

function getTransferredTokenFromHash() {
  if (typeof window === "undefined" || !window.location.hash) {
    return null;
  }

  const params = new URLSearchParams(window.location.hash.slice(1));
  const transferredToken = normalizeAuthToken(
    params.get("token") ?? params.get("access_token")
  );

  if (!transferredToken) {
    return null;
  }

  params.delete("token");
  params.delete("access_token");

  const nextHash = params.toString();
  const nextUrl = `${window.location.pathname}${window.location.search}${
    nextHash ? `#${nextHash}` : ""
  }`;

  window.history.replaceState(null, "", nextUrl);

  return transferredToken;
}

type AuthCtx = {
  user: User | null;
  token: string | null; // NYTT: Exponera token för att fixa TypeScript-fel
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<User>;
  adminLogin: (data: LoginRequest) => Promise<User>;
  googleLogin: (data: GoogleAuthRequest) => Promise<User>;
  googleRegister: (data: GoogleAuthRequest) => Promise<User>;
  completeAuth: (response: AuthInput) => User;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>; 
  updateUser: (data: UpdateUserRequest) => Promise<User>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // NYTT: State för att lagra token
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initiera vid start
  useEffect(() => {
    const initAuth = async () => {
      const transferredToken = getTransferredTokenFromHash();
      const storedToken =
        typeof window !== "undefined"
          ? transferredToken ?? normalizeAuthToken(getStoredAuthToken())
          : null;

      if (!storedToken) {
        setStoredAuthToken(null);
        setIsLoading(false);
        return;
      }

      try {
        setStoredAuthToken(storedToken);
        setToken(storedToken); // Synka state med localStorage

        const session = await authService.session(storedToken);
        const accessToken = getOptionalAuthResponseToken(session) ?? storedToken;
        const userData = withSessionEmail(getAuthResponseUser(session), accessToken);
        setStoredAuthToken(accessToken);
        setToken(accessToken);
        setUser(userData);
      } catch (error) {
        // Rensa token ENBART när servern uttryckligen avvisar den (401/403).
        // Nätverksfel eller 5xx vid sidladdning får inte logga ut användaren.
        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          console.error("Token ogiltig", error);
          setStoredAuthToken(null);
          setToken(null);
          setUser(null);
        } else {
          console.error("Kunde inte verifiera sessionen (behåller token)", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const applyAuthResponse = useCallback((res: AuthInput) => {
    const normalizedResponse = normalizeAuthResponse(res as AuthPayload);
    const accessToken = getAuthResponseToken(normalizedResponse);
    const userData = withSessionEmail(
      getAuthResponseUser(normalizedResponse),
      accessToken
    );
    // Ny inloggning = potentiellt ny identitet. Töm cachen så att personlig
    // data (ansökningar, favoriter, köer) aldrig läcker mellan konton.
    queryClient.clear();
    setStoredAuthToken(accessToken);
    setToken(accessToken);
    setUser(userData);
    return userData;
  }, [queryClient]);

  const applyAuthResponseFromSession = useCallback(async (res: AuthInput) => {
    const normalizedResponse = normalizeAuthResponse(res as AuthPayload);
    const accessToken = getAuthResponseToken(normalizedResponse);
    const responseUser = withSessionEmail(
      getAuthResponseUser(normalizedResponse),
      accessToken
    );

    queryClient.clear();
    setStoredAuthToken(accessToken);
    setToken(accessToken);
    setUser(responseUser);

    try {
      const session = await authService.session(accessToken);
      const sessionToken = getOptionalAuthResponseToken(session) ?? accessToken;
      const userData = withSessionEmail(getAuthResponseUser(session), sessionToken);

      setStoredAuthToken(sessionToken);
      setToken(sessionToken);
      setUser(userData);
      return userData;
    } catch (error) {
      console.warn("Could not refresh session after auth response", error);
      setStoredAuthToken(accessToken);
      setToken(accessToken);
      setUser(responseUser);
      return responseUser;
    }
  }, [queryClient]);

  // 2. Login
  const login = async (data: LoginRequest) => {
    const res = await authService.login(data);
    return applyAuthResponseFromSession(res as unknown as AuthPayload);
  };

  const adminLogin = async (data: LoginRequest) => {
    const res = await authService.adminLogin(data);
    return applyAuthResponse(res as unknown as AuthPayload);
  };

  const googleLogin = async (data: GoogleAuthRequest) => {
    const res = await authService.googleLogin(data);
    return applyAuthResponseFromSession(res as unknown as AuthPayload);
  };

  const googleRegister = async (data: GoogleAuthRequest) => {
    const res = await authService.googleRegister(data);
    return applyAuthResponse(res as unknown as AuthPayload);
  };

  // 3. Register
  const register = async (data: RegisterRequest) => {
    const res = await authService.register(data);
    if ("authRef" in res) {
      throw new Error("Studentregistrering behöver verifieras med Freja först.");
    }

    return applyAuthResponse(res as unknown as AuthPayload);
  };

  // 4. Logout
  const logout = () => {
    authService.logout();
    setToken(null); // Rensa state vid utloggning
    setUser(null);
    // Töm hela query-cachen: personliga nycklar är inte användarskopade,
    // så cachad data skulle annars överleva till nästa konto på samma dator.
    queryClient.clear();
  };

  // 5. Refresh (Hämta om användaren från servern)
  const refreshUser = async () => {
    try {
      const session = await authService.session();
      const accessToken =
        getOptionalAuthResponseToken(session) ??
        normalizeAuthToken(getStoredAuthToken());
      const updatedUser = withSessionEmail(getAuthResponseUser(session), accessToken);
      if (accessToken) {
        setStoredAuthToken(accessToken);
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
      adminLogin,
      googleLogin,
      googleRegister,
      completeAuth: (response) => applyAuthResponse(response as unknown as AuthPayload),
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
