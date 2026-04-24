import { apiClient, normalizeAuthToken } from "@/lib/api-client";
import {
  User,
  AuthResponse,
  FrejaAuthStatus,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  UpdateUserRequest,
} from "@/types";

export function getAuthResponseToken(response: AuthResponse): string {
  const source =
    response.accessToken ??
    response.token ??
    response.access_token ??
    response.jwt ??
    response.bearerToken;

  const token = normalizeAuthToken(source);
  if (!token) {
    throw new Error("Inloggningen lyckades men backend skickade ingen JWT-token.");
  }

  return token;
}

export const authService = {
  // Hämta nuvarande användare
  me: async (token?: string | null): Promise<User> => {
    return await apiClient<User>("/auth/me", {}, token);
  },

  // Logga in
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    });
    return res;
  },

  // Registrera (Ny endpoint!)
  register: async (payload: RegisterRequest): Promise<RegisterResponse> => {
    const res = await apiClient<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
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
