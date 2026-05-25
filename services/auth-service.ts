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
  GoogleRegisterResponse,
  QuickRegisterRequest,
  RegisterStudentRequest,
  FrejaAuthRef,
} from "@/types";

type AuthResponseLike = Partial<AuthResponse> & Record<string, unknown>;
type JwtPayload = {
  sub?: string;
  uid?: number | string;
  accountType?: string;
};

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
  quick_register: "quick_register",
  admin: "admin",
};

const SWEDISH_CITY_ENUMS: Record<string, string> = {
  GÖTEBORG: "GÖTEBORG",
  GOTEBORG: "GÖTEBORG",
  STOCKHOLM: "STOCKHOLM",
  LUND: "LUND",
  UPPSALA: "UPPSALA",
  MALMÖ: "MALMÖ",
  MALMO: "MALMÖ",
  LINKÖPING: "LINKÖPING",
  LINKOPING: "LINKÖPING",
  ÖREBRO: "ÖREBRO",
  OREBRO: "ÖREBRO",
  VÄSTERÅS: "VÄSTERÅS",
  VASTERAS: "VÄSTERÅS",
  HELSINGBORG: "HELSINGBORG",
  JÖNKÖPING: "JÖNKÖPING",
  JONKOPING: "JÖNKÖPING",
  NORRKÖPING: "NORRKÖPING",
  NORRKOPING: "NORRKÖPING",
  HALMSTAD: "HALMSTAD",
  LULEÅ: "LULEÅ",
  LULEA: "LULEÅ",
  SUNDSVALL: "SUNDSVALL",
  VÄXJÖ: "VÄXJÖ",
  VAXJO: "VÄXJÖ",
  BORÅS: "BORÅS",
  BORAS: "BORÅS",
  ESKILSTUNA: "ESKILSTUNA",
  GÄVLE: "GÄVLE",
  GAVLE: "GÄVLE",
  TROLLHÄTTAN: "TROLLHÄTTAN",
  TROLLHATTAN: "TROLLHÄTTAN",
  SKÖVDE: "SKÖVDE",
  SKOVDE: "SKÖVDE",
  KARLSTAD: "KARLSTAD",
  SKELLEFTEÅ: "SKELLEFTEÅ",
  SKELLEFTEA: "SKELLEFTEÅ",
  KALMAR: "KALMAR",
  KATRINEHOLM: "KATRINEHOLM",
  FALUN: "FALUN",
  KUNGSBACKA: "KUNGSBACKA",
  VARBERG: "VARBERG",
  LIDKÖPING: "LIDKÖPING",
  LIDKOPING: "LIDKÖPING",
  MOTALA: "MOTALA",
  UDDEVALLA: "UDDEVALLA",
  STRÖMSTAD: "STRÖMSTAD",
  STROMSTAD: "STRÖMSTAD",
  ESLÖV: "ESLÖV",
  ESLOV: "ESLÖV",
};

const compactObject = <T extends object>(value: T) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  ) as Partial<T>;

const firstString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
};

const firstNumber = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
};

function decodeJwtPayload(token: string | null): JwtPayload {
  if (!token) return {};

  try {
    const payload = token.split(".")[1];
    if (!payload) return {};

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );
    const decoded =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf8");

    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return {};
  }
}

function normalizeCityEnum(value: string | undefined | null): string | undefined {
  const trimmed = value?.normalize("NFC").trim();
  if (!trimmed) {
    return undefined;
  }

  const key = trimmed
    .toUpperCase()
    .replace(/\s+/g, "_")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return SWEDISH_CITY_ENUMS[key] ?? SWEDISH_CITY_ENUMS[trimmed.toUpperCase()] ?? trimmed.toUpperCase();
}

function requireCityEnum(value: string | undefined | null): string {
  const city = normalizeCityEnum(value);
  if (!city) {
    throw new Error("Välj stad.");
  }

  return city;
}

export function getAuthResponseToken(response: Partial<AuthResponse>): string {
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

function createUserFromFlatAuthResponse(
  response: Record<string, unknown>,
  token: string
): User {
  const jwtPayload = decodeJwtPayload(token);
  const firstName = firstString(response.firstName);
  const surname = firstString(response.surname);
  const email = firstString(response.email, jwtPayload.sub) ?? "";
  const accountType = firstString(response.accountType, jwtPayload.accountType);
  const id = firstNumber(response.id, response.userId, jwtPayload.uid) ?? 0;
  const displayName =
    firstString(response.displayName) ||
    [firstName, surname].filter(Boolean).join(" ") ||
    firstString(response.companyName, response.fullName, email) ||
    "Användare";

  return {
    ...(response as Partial<User>),
    id,
    email,
    accountType: (accountType?.toLowerCase() ?? "quick_register") as User["accountType"],
    displayName,
    createdAt: firstString(response.createdAt) ?? new Date(0).toISOString(),
    verified:
      typeof response.verified === "boolean"
        ? response.verified
        : Boolean(response.verifiedStudent ?? response.verifiedIdentity),
    firstName,
    surname,
  };
}

export function normalizeAuthResponse(
  response: Partial<AuthResponse> & Record<string, unknown>
): AuthResponse {
  const token = getAuthResponseToken(response);

  return {
    accessToken: token,
    user:
      response.user && typeof response.user === "object"
        ? (response.user as User)
        : createUserFromFlatAuthResponse(response, token),
  };
}

export function authResponseFromGoogleRegisterResponse(
  response: GoogleRegisterResponse
): AuthResponse {
  return normalizeAuthResponse(
    response as unknown as Partial<AuthResponse> & Record<string, unknown>
  );
}

export function getAuthResponseUser(response: AuthResponse): User {
  const token = getOptionalAuthResponseToken(response);

  if (response.user && typeof response.user === "object") {
    const profile = response.user as User & Record<string, unknown>;
    const fallbackUser = createUserFromFlatAuthResponse(profile, token ?? "");
    const firstName =
      typeof profile.firstName === "string"
        ? profile.firstName.trim()
        : fallbackUser.firstName ?? "";
    const surname =
      typeof profile.surname === "string"
        ? profile.surname.trim()
        : fallbackUser.surname ?? "";
    const displayName =
      typeof profile.displayName === "string" && profile.displayName.trim()
        ? profile.displayName.trim()
        : [firstName, surname].filter(Boolean).join(" ") ||
          (typeof profile.companyName === "string" ? profile.companyName : "") ||
          (typeof profile.fullName === "string" ? profile.fullName : "") ||
          (typeof profile.email === "string" ? profile.email : "") ||
          fallbackUser.displayName ||
          "Användare";
    const accountType =
      typeof profile.accountType === "string"
        ? (profile.accountType.toLowerCase() as User["accountType"])
        : fallbackUser.accountType;

    return {
      ...fallbackUser,
      ...profile,
      id:
        typeof profile.id === "number"
          ? profile.id
          : fallbackUser.id,
      email:
        typeof profile.email === "string" && profile.email.trim()
          ? profile.email.trim()
          : fallbackUser.email,
      accountType,
      displayName,
      createdAt:
        typeof profile.createdAt === "string"
          ? profile.createdAt
          : fallbackUser.createdAt,
      verified:
        typeof profile.verified === "boolean"
          ? profile.verified
          : Boolean(profile.verifiedStudent ?? profile.verifiedIdentity),
      schoolId:
        typeof profile.schoolId === "number"
          ? profile.schoolId
          : typeof profile.school_id === "number"
            ? profile.school_id
            : fallbackUser.schoolId,
      firstName,
      surname,
    };
  }

  const responseLike = response as unknown as Record<string, unknown>;
  if (
    typeof responseLike === "object" &&
    responseLike !== null &&
    (typeof responseLike.accountType === "string" ||
      typeof responseLike.email === "string" ||
      token)
  ) {
    return createUserFromFlatAuthResponse(responseLike, token ?? "");
  }

  throw new Error("Backend skickade ingen anvandare i auth-svaret.");
}

export function isAuthResponse(response: unknown): response is AuthResponse {
  if (typeof response !== "object" || response === null || Array.isArray(response)) {
    return false;
  }

  const responseLike = response as Partial<AuthResponse> & Record<string, unknown>;
  return TOKEN_KEYS.some(
    (key) =>
      typeof responseLike[key] === "string" &&
      String(responseLike[key]).trim().length > 0
  );
}

export function isGoogleRegisterResponse(
  response: unknown
): response is GoogleRegisterResponse {
  if (typeof response !== "object" || response === null || Array.isArray(response)) {
    return false;
  }

  const responseLike = response as Partial<GoogleRegisterResponse> &
    Record<string, unknown>;

  return (
    responseLike.user === undefined &&
    typeof responseLike.email === "string" &&
    responseLike.email.trim().length > 0 &&
    TOKEN_KEYS.some(
      (key) =>
        typeof responseLike[key] === "string" &&
        String(responseLike[key]).trim().length > 0
    )
  );
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

  googleLogin: async (
    payload: GoogleAuthRequest
  ): Promise<AuthResponse | GoogleRegisterResponse> => {
    const googleIdToken = payload.googleIdToken.trim();
    if (!googleIdToken) {
      throw new Error("Google-token krävs.");
    }

    return apiClient<AuthResponse | GoogleRegisterResponse>("/auth/google/login", {
      method: "POST",
      body: JSON.stringify({ googleIdToken }),
      auth: false,
    });
  },

  quickRegister: async (payload: QuickRegisterRequest): Promise<AuthResponse> => {
    const email = payload.email.trim();
    const password = payload.password.trim();
    if (!email || !password) {
      throw new Error("E-postadress och lösenord krävs.");
    }

    return apiClient<AuthResponse>("/auth/quick-register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false,
    });
  },

  registerStudent: async (
    payload: RegisterStudentRequest
  ): Promise<AuthResponse> => {
    const email = payload.email.trim();
    const firstName = payload.firstName.trim();
    const surname = payload.surname.trim();
    const ssn = payload.ssn.trim();
    const city = requireCityEnum(payload.city);

    if (!email || !firstName || !surname || !ssn || !payload.schoolId) {
      throw new Error("Fyll i namn, e-post, skola, stad och personnummer.");
    }

    return apiClient<AuthResponse>("/auth/register-student", {
      method: "POST",
      body: JSON.stringify({
        firstName,
        surname,
        email,
        schoolId: payload.schoolId,
        city,
        ssn,
      }),
      auth: false,
    });
  },

  registerWorker: async (payload: RegisterRequest): Promise<AuthResponse> => {
    if (payload.accountType !== "company") {
      throw new Error("Aktuell backend stöder bara företagsregistrering via register-worker.");
    }

    const requestPayload = compactObject({
      accountType: payload.accountType,
      email: payload.email.trim(),
      password: payload.password,
      phone: payload.phone?.trim(),
      city: normalizeCityEnum(payload.city),
      companyName: payload.companyName?.trim(),
      fullName: payload.fullName?.trim(),
    });

    return apiClient<AuthResponse>("/auth/register-worker", {
      method: "POST",
      body: JSON.stringify(requestPayload),
      auth: false,
    });
  },

  register: async (payload: RegisterRequest): Promise<RegisterResponse> => {
    if (payload.accountType !== "student") {
      return authService.registerWorker(payload);
    }

    const quickRegisterResponse = await authService.quickRegister({
      email: payload.email,
      password: payload.password,
    });

    const hasStudentDetails =
      Boolean(payload.firstName?.trim()) &&
      Boolean(payload.surname?.trim()) &&
      Boolean(payload.ssn?.trim()) &&
      Boolean(payload.schoolId) &&
      Boolean(payload.city?.trim());

    if (!hasStudentDetails) {
      return quickRegisterResponse;
    }

    return authService.registerStudent({
      firstName: payload.firstName!,
      surname: payload.surname!,
      email: payload.email,
      schoolId: payload.schoolId!,
      city: payload.city!,
      ssn: payload.ssn!,
    });
  },

  googleRegister: async (
    payload: GoogleAuthRequest
  ): Promise<GoogleRegisterResponse> => {
    const googleIdToken = payload.googleIdToken.trim();

    if (!googleIdToken) {
      throw new Error("Google-token krävs.");
    }

    return apiClient<GoogleRegisterResponse>("/auth/google/register", {
      method: "POST",
      body: JSON.stringify({ googleIdToken }),
      auth: false,
    });
  },

  frejaRegister: async (): Promise<FrejaRegisterResponse> => {
    return apiClient<FrejaRegisterResponse>("/auth/freja/register", {
      method: "POST",
      auth: false,
    });
  },

  verifyIdentity: async (): Promise<FrejaAuthRef> => {
    return apiClient<FrejaAuthRef>("/auth/verify-identity", {
      method: "POST",
    });
  },

  pollAuthStatus: async (authRef: string): Promise<FrejaAuthStatus | AuthResponse> => {
    return apiClient<FrejaAuthStatus | AuthResponse>(
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
