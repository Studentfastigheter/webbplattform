import { promises as fs } from "node:fs";
import { createSign } from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const localWaitlistPath = path.join(process.cwd(), "data", "waitlist.local.json");
const firebaseWriteTimeoutMs = 10_000;

type WaitlistRequest = {
  email?: unknown;
};

type LocalWaitlistEntry = {
  email: string;
  createdAt: string;
};

type FirestoreErrorResponse = {
  error?: {
    status?: string;
    message?: string;
  };
};

type FirestoreCommitResponse = {
  writeResults?: unknown[];
};

type FirebaseServiceAccount = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

type GoogleAccessTokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type FirestoreAuth =
  | {
      type: "service-account";
      accessToken: string;
    }
  | {
      type: "api-key";
      apiKey: string;
    };

class FirestoreWriteError extends Error {
  constructor(
    message: string,
    public readonly status?: string,
  ) {
    super(message);
    this.name = "FirestoreWriteError";
  }
}

let cachedGoogleAccessToken: { token: string; expiresAt: number } | null = null;

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function validateEmail(email: string): string | null {
  if (!email) return "Ange en e-postadress.";
  if (!emailRegex.test(email)) return "Ange en giltig e-postadress.";
  if (email.length > 254) return "E-postadressen är för lång.";
  return null;
}

function normalizePrivateKey(value: string): string {
  return value.replace(/\\n/g, "\n");
}

function getServiceAccountFromJson(value: string): FirebaseServiceAccount | null {
  try {
    const parsed = JSON.parse(value) as {
      project_id?: unknown;
      client_email?: unknown;
      private_key?: unknown;
    };

    if (
      typeof parsed.project_id !== "string" ||
      typeof parsed.client_email !== "string" ||
      typeof parsed.private_key !== "string"
    ) {
      return null;
    }

    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: normalizePrivateKey(parsed.private_key),
    };
  } catch {
    return null;
  }
}

function getFirebaseServiceAccount(): FirebaseServiceAccount | null {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (rawJson) {
    return getServiceAccountFromJson(rawJson);
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey: normalizePrivateKey(privateKey),
  };
}

function getPublicFirestoreConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  return {
    apiKey,
    projectId,
    isConfigured: Boolean(apiKey && projectId),
  };
}

function base64UrlEncode(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

function createServiceAccountJwt(serviceAccount: FirebaseServiceAccount): string {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const claims = {
    iss: serviceAccount.clientEmail,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(claims))}`;
  const signer = createSign("RSA-SHA256");

  signer.update(unsignedToken);
  signer.end();

  return `${unsignedToken}.${base64UrlEncode(signer.sign(serviceAccount.privateKey))}`;
}

async function getGoogleAccessToken(serviceAccount: FirebaseServiceAccount): Promise<string> {
  if (cachedGoogleAccessToken && cachedGoogleAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedGoogleAccessToken.token;
  }

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: createServiceAccountJwt(serviceAccount),
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const payload = (await response.json().catch(() => null)) as GoogleAccessTokenResponse | null;

  if (!response.ok || !payload?.access_token) {
    throw new Error(payload?.error_description || payload?.error || "Firebase service account token request failed");
  }

  cachedGoogleAccessToken = {
    token: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000,
  };

  return cachedGoogleAccessToken.token;
}

function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.message === "WAITLIST_FIREBASE_TIMEOUT";
}

function isFirestorePermissionError(error: unknown): boolean {
  return error instanceof FirestoreWriteError && error.status === "PERMISSION_DENIED";
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("WAITLIST_FIREBASE_TIMEOUT"));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

async function writeFirestoreWaitlistDocument(
  projectId: string,
  email: string,
  auth: FirestoreAuth,
): Promise<{ alreadyRegistered: boolean }> {
  const databasePath = `projects/${projectId}/databases/(default)`;
  const documentPath = `${databasePath}/documents/waitlist/${email}`;
  const url = new URL(`https://firestore.googleapis.com/v1/${databasePath}/documents:commit`);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (auth.type === "service-account") {
    headers.Authorization = `Bearer ${auth.accessToken}`;
  } else {
    url.searchParams.set("key", auth.apiKey);
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      writes: [
        {
          update: {
            name: documentPath,
            fields: {
              Email: { stringValue: email },
            },
          },
          currentDocument: {
            exists: false,
          },
          updateTransforms: [
            {
              fieldPath: "CreatedAt",
              setToServerValue: "REQUEST_TIME",
            },
          ],
        },
      ],
    }),
  });

  if (response.ok) {
    const payload = (await response.json().catch(() => null)) as FirestoreCommitResponse | null;
    return { alreadyRegistered: !payload?.writeResults?.length };
  }

  const payload = (await response.json().catch(() => null)) as FirestoreErrorResponse | null;
  const status = payload?.error?.status;

  if (status === "ALREADY_EXISTS") {
    return { alreadyRegistered: true };
  }

  throw new FirestoreWriteError(payload?.error?.message || "Firestore waitlist write failed", status);
}

async function saveToFirestoreWaitlist(email: string): Promise<{ alreadyRegistered: boolean }> {
  const serviceAccount = getFirebaseServiceAccount();

  if (serviceAccount) {
    const accessToken = await getGoogleAccessToken(serviceAccount);
    return writeFirestoreWaitlistDocument(serviceAccount.projectId, email, {
      type: "service-account",
      accessToken,
    });
  }

  const { apiKey, projectId, isConfigured } = getPublicFirestoreConfig();

  if (!isConfigured || !apiKey || !projectId) {
    throw new Error("WAITLIST_FIREBASE_NOT_CONFIGURED");
  }

  return writeFirestoreWaitlistDocument(projectId, email, {
    type: "api-key",
    apiKey,
  });
}

async function readLocalWaitlist(): Promise<LocalWaitlistEntry[]> {
  try {
    const content = await fs.readFile(localWaitlistPath, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error
        ? String((error as { code: unknown }).code)
        : "";

    if (code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function saveToLocalWaitlist(email: string): Promise<{ alreadyRegistered: boolean }> {
  const entries = await readLocalWaitlist();
  const alreadyRegistered = entries.some((entry) => entry.email === email);

  if (alreadyRegistered) {
    return { alreadyRegistered: true };
  }

  entries.push({
    email,
    createdAt: new Date().toISOString(),
  });

  await fs.mkdir(path.dirname(localWaitlistPath), { recursive: true });
  await fs.writeFile(localWaitlistPath, `${JSON.stringify(entries, null, 2)}\n`, "utf8");

  return { alreadyRegistered: false };
}

export async function POST(request: Request) {
  let body: WaitlistRequest;

  try {
    body = (await request.json()) as WaitlistRequest;
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const validationError = validateEmail(email);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    if (getFirebaseServiceAccount() || getPublicFirestoreConfig().isConfigured) {
      try {
        const firestoreResult = await withTimeout(saveToFirestoreWaitlist(email), firebaseWriteTimeoutMs);
        return NextResponse.json({ ok: true, ...firestoreResult });
      } catch (error) {
        if (
          process.env.NODE_ENV !== "production" &&
          (isTimeoutError(error) || isFirestorePermissionError(error))
        ) {
          console.warn("Waitlist Firebase write failed in development, saving locally instead.");
          const localResult = await saveToLocalWaitlist(email);
          return NextResponse.json({ ok: true, ...localResult, storage: "local" });
        }

        throw error;
      }
    }

    if (process.env.NODE_ENV !== "production") {
      const localResult = await saveToLocalWaitlist(email);
      return NextResponse.json({ ok: true, ...localResult, storage: "local" });
    }

    return NextResponse.json(
      { error: "Waitlisten är inte konfigurerad på servern ännu." },
      { status: 500 },
    );
  } catch (error) {
    console.error("Waitlist submit failed", error);
    return NextResponse.json(
      { error: "Något gick fel vid registreringen. Försök igen." },
      { status: 500 },
    );
  }
}
