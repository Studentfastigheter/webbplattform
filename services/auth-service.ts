import { apiClient, normalizeAuthToken, pathSegment } from "@/lib/api-client";
import {
  User,
  AuthResponse,
  FrejaAuthStatus,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  GoogleAuthRequest,
  FrejaRegisterResponse,
  ChangePasswordRequest,
  UpdateUserRequest,
  StartPasswordResetRequest,
  PasswordResetAccountType,
  PasswordResetFinalRequest,
  VerifyEmailRequest,
} from "@/types";

type AuthResponseLike = AuthResponse & Record<string, unknown>;

const TOKEN_KEYS = [
  "accessToken",
  "token",
  "access_token",
  "jwt",
  "bearerToken",
] as const;

const PASSWORD_RESET_ACCOUNT_TYPE_MAP: Record<string, PasswordResetAccountType> = {
  student: "student",
  company: "company",
  private_landlord: "landlord",
  landlord: "landlord",
  admin: "admin",
};

const compactObject = <T extends object>(value: T) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  ) as Partial<T>;

export function getAuthResponseToken(response: AuthResponse): string {
  const responseLike = response as AuthResponseLike;
  const source = TOKEN_KEYS.map((key) => responseLike[key]).find(
    (value) => typeof value === "string" && value.trim().length > 0
  );

  const token = normalizeAuthToken(source);
  if (!token) {
    throw new Error("Inloggningen lyckades men backend skickade ingen JWT-token.");
  }

  return token;
}

export function getOptionalAuthResponseToken(
  response: Partial<AuthResponse>
): string | null {
  const responseLike = response as AuthResponseLike;
  const source = TOKEN_KEYS.map((key) => responseLike[key]).find(
    (value) => typeof value === "string" && value.trim().length > 0
  );

  return normalizeAuthToken(source);
}

export function getAuthResponseUser(response: AuthResponse): User {
  if (response.user && typeof response.user === "object") {
    return response.user;
  }

  const responseLike = response as unknown as Record<string, unknown>;
  if (
    typeof responseLike === "object" &&
    responseLike !== null &&
    (typeof responseLike.accountType === "string" ||
      typeof responseLike.email === "string")
  ) {
    return responseLike as unknown as User;
  }

  throw new Error("Backend skickade ingen anvandare i auth-svaret.");
}

function persistAuthToken(token: string | null) {
  if (typeof window === "undefined" || !token) {
    return;
  }

  localStorage.setItem("token", token);
}

function clearAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("token");
}

export function isStudentRegistrationResponse(
  response: RegisterResponse
): response is { authRef: string } {
  return (
    typeof response === "object" &&
    response !== null &&
    "authRef" in response &&
    typeof response.authRef === "string" &&
    response.authRef.trim().length > 0
  );
}

function normalizePasswordResetAccountType(
  accountType: StartPasswordResetRequest["accountType"]
): PasswordResetAccountType {
  const normalized =
    PASSWORD_RESET_ACCOUNT_TYPE_MAP[String(accountType).trim().toLowerCase()];

  if (!normalized) {
    throw new Error("Ogiltig kontotyp för återställning av lösenord.");
  }

  return normalized;
}

async function fetchCurrentSession(token?: string | null): Promise<AuthResponse> {
  const session = await apiClient<AuthResponse>("/auth/me", {}, token);
  const refreshedToken = getOptionalAuthResponseToken(session);
  persistAuthToken(refreshedToken);
  return session;
}

export const authService = {
  session: async (token?: string | null): Promise<AuthResponse> => {
    return fetchCurrentSession(token);
  },

  me: async (token?: string | null): Promise<User> => {
    return getAuthResponseUser(await fetchCurrentSession(token));
  },

  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const email = payload.email.trim();
    if (!email || !payload.password) {
      throw new Error("Fyll i e-postadress och lösenord.");
    }

    return apiClient<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: payload.password }),
      auth: false,
    });
  },

  googleLogin: async (payload: GoogleAuthRequest): Promise<AuthResponse> => {
    const googleIdToken = payload.googleIdToken.trim();
    const city = payload.city.trim();
    if (!googleIdToken || !city) {
      throw new Error("Google-token och stad krävs.");
    }

    return apiClient<AuthResponse>("/auth/google/login", {
      method: "POST",
      body: JSON.stringify({ googleIdToken, city }),
      auth: false,
    });
  },

  register: async (payload: RegisterRequest): Promise<RegisterResponse> => {
    const requestPayload = compactObject({
      ...payload,
      email: payload.email.trim(),
      phone: payload.phone?.trim(),
      city: payload.city?.trim(),
      ssn: payload.ssn?.trim(),
      firstName: payload.firstName?.trim(),
      surname: payload.surname?.trim(),
      companyName: payload.companyName?.trim(),
      fullName: payload.fullName?.trim(),
    });

    return apiClient<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(requestPayload),
      auth: false,
    });
  },

  googleRegister: async (
    payload: GoogleAuthRequest
  ): Promise<AuthResponse> => {
    const googleIdToken = payload.googleIdToken.trim();
    const city = payload.city.trim();

    if (!googleIdToken || !city) {
      throw new Error("Google-token och stad krävs.");
    }

    return apiClient<AuthResponse>("/auth/google/register", {
      method: "POST",
      body: JSON.stringify({ googleIdToken, city }),
      auth: false,
    });
  },

  frejaRegister: async (): Promise<FrejaRegisterResponse> => {
    return apiClient<FrejaRegisterResponse>("/auth/freja/register", {
      method: "POST",
      auth: false,
    });
  },

  pollAuthStatus: async (authRef: string): Promise<FrejaAuthStatus> => {
    return apiClient<FrejaAuthStatus>(
      `/auth/poll/${pathSegment(authRef)}`,
      { auth: false }
    );
  },

  startPasswordReset: async (
    payload: StartPasswordResetRequest
  ): Promise<void> => {
    const userEmail = payload.userEmail.trim();
    if (!userEmail) {
      throw new Error("Ange e-postadressen för kontot.");
    }

    await apiClient<void>("/auth/reset-password", {
      method: "POST",
      auth: false,
      body: JSON.stringify({
        userEmail,
        accountType: normalizePasswordResetAccountType(payload.accountType),
      }),
    });
  },

  resetPassword: async (payload: PasswordResetFinalRequest): Promise<void> => {
    const resetId = payload.resetId.trim();
    const newPassword = payload.newPassword.trim();

    if (!resetId || !newPassword) {
      throw new Error("Återställnings-id och nytt lösenord krävs.");
    }

    await apiClient<void>("/auth/reset-password", {
      method: "PUT",
      auth: false,
      body: JSON.stringify({ resetId, newPassword }),
    });
  },

  verifyEmail: async (payload: VerifyEmailRequest): Promise<void> => {
    const email = payload.email.trim();
    if (!email) {
      throw new Error("Ange e-postadressen som ska verifieras.");
    }

    await apiClient<void>("/auth/verify-email", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email }),
    });
  },

  finalizeEmailVerification: async (verificationId: string): Promise<void> => {
    const id = verificationId.trim();
    if (!id) {
      throw new Error("Verifierings-id saknas.");
    }

    await apiClient<void>(`/auth/verify-email/finalize/${pathSegment(id)}`, {
      auth: false,
    });
  },

  updateProfile: async (data: UpdateUserRequest): Promise<User> => {
    const payload = compactObject<UpdateUserRequest>({
      firstName: data.firstName,
      surname: data.surname,
      phone: data.phone,
      city: data.city,
      aboutText: data.aboutText,
      description: data.description,
    });

    return apiClient<User>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    void data;
    throw new Error(
      "Lösenordsbyte för inloggade användare finns inte i aktuell API-version. Använd lösenordsåterställning i stället."
    );
  },

  logout: () => {
    clearAuthToken();
  },
};
