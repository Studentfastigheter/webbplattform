import { apiClient } from "@/lib/api-client";
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateUserRequest,
} from "@/types";

export const authService = {
  // Hämta nuvarande användare
  me: async (): Promise<User> => {
    return await apiClient<User>("/auth/me");
  },

  // Logga in
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res;
  },

  // Registrera (Ny endpoint!)
  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    const res = await apiClient<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res;
  },

  // Uppdatera profil
  updateProfile: async (data: UpdateUserRequest): Promise<User> => {
    return await apiClient<User>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Logga ut (Frontend only)
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  },
};