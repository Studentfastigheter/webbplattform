import { apiClient } from "@/lib/api-client";
import {
  User,
  AuthResponse,
  FrejaAuthStatus,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
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
  register: async (payload: RegisterRequest): Promise<RegisterResponse> => {
    const res = await apiClient<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res;
  },

  pollAuthStatus: async (authRef: string): Promise<FrejaAuthStatus> => {
    return await apiClient<FrejaAuthStatus>(
      `/auth/poll/${encodeURIComponent(authRef)}`
    );
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
