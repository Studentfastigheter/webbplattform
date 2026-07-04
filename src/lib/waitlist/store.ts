import { createSign } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const localWaitlistPath = path.join(process.cwd(), "data", "waitlist.local.json");
const firebaseRequestTimeoutMs = 10_000;

export type WaitlistStorage = "firestore" | "local";

export type WaitlistEntry = {
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

type FirestoreListResponse = {
  documents?: FirestoreDocument[];
  nextPageToken?: string;
};

type FirestoreDocument = {
  name?: string;
  createTime?: string;
  updateTime?: string;
  fields?: Record<string, FirestoreValue | undefined>;
};

type FirestoreValue = {
  stringValue?: string;
  timestampValue?: string;
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

class FirestoreWaitlistError extends Error {
  constructor(
    message: string,
    public readonly status?: string,
  ) {
    super(message);
    this.name = "FirestoreWaitlistError";
  }
}

let cachedGoogleAccessToken: { token: string; expiresAt: number } | null = null;

function normalizePrivateKey(value: string): string {
  const trimmed = value.trim().replace(/,\s*$/, "");
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed;

  return unquoted.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
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

export function getFirebaseServiceAccount(): FirebaseServiceAccount | null {
  const rawJson =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (rawJson) {
    return getServiceAccountFromJson(rawJson);
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
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

export function getPublicFirestoreConfig() {
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

async function getGoogleAccessToken(
  serviceAccount: FirebaseServiceAccount,
): Promise<string> {
  if (
    cachedGoogleAccessToken &&
    cachedGoogleAccessToken.expiresAt > Date.now() + 60_000
  ) {
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
  const payload = (await response.json().catch(() => null)) as
    | GoogleAccessTokenResponse
    | null;

  if (!response.ok || !payload?.access_token) {
    throw new Error(
      payload?.error_description ||
        payload?.error ||
        "Firebase service account token request failed",
    );
  }

  cachedGoogleAccessToken = {
    token: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000,
  };

  return cachedGoogleAccessToken.token;
}

export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.message === "WAITLIST_FIREBASE_TIMEOUT";
}

export function isFirestorePermissionError(error: unknown): boolean {
  return (
    error instanceof FirestoreWaitlistError &&
    error.status === "PERMISSION_DENIED"
  );
}

function isAlreadyExistsError(error: unknown): boolean {
  return (
    error instanceof FirestoreWaitlistError &&
    error.status === "ALREADY_EXISTS"
  );
}

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = firebaseRequestTimeoutMs,
): Promise<T> {
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

function applyFirestoreAuth(
  url: URL,
  headers: Record<string, string>,
  auth: FirestoreAuth,
) {
  if (auth.type === "service-account") {
    headers.Authorization = `Bearer ${auth.accessToken}`;
  } else {
    url.searchParams.set("key", auth.apiKey);
  }
}

function firestoreDatabasePath(projectId: string) {
  return `projects/${projectId}/databases/(default)`;
}

async function getFirestoreAuth(): Promise<
  | {
      projectId: string;
      auth: FirestoreAuth;
    }
  | null
> {
  const serviceAccount = getFirebaseServiceAccount();

  if (serviceAccount) {
    const accessToken = await getGoogleAccessToken(serviceAccount);

    return {
      projectId: serviceAccount.projectId,
      auth: {
        type: "service-account",
        accessToken,
      },
    };
  }

  // api-key-fallbacken fungerar bara om Firestore-reglerna tillåter
  // oautentiserade skrivningar — det får ALDRIG vara sant i produktion för
  // en samling med personuppgifter. Kräv service account där; fallbacken
  // finns kvar enbart för lokal utveckling.
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const { apiKey, projectId, isConfigured } = getPublicFirestoreConfig();

  if (!isConfigured || !apiKey || !projectId) {
    return null;
  }

  return {
    projectId,
    auth: {
      type: "api-key",
      apiKey,
    },
  };
}

async function writeFirestoreWaitlistDocument(
  projectId: string,
  email: string,
  auth: FirestoreAuth,
): Promise<{ alreadyRegistered: boolean }> {
  const databasePath = firestoreDatabasePath(projectId);
  const documentPath = `${databasePath}/documents/waitlist/${email}`;
  const url = new URL(
    `https://firestore.googleapis.com/v1/${databasePath}/documents:commit`,
  );
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  applyFirestoreAuth(url, headers, auth);

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
    const payload = (await response.json().catch(() => null)) as
      | FirestoreCommitResponse
      | null;
    return { alreadyRegistered: !payload?.writeResults?.length };
  }

  const payload = (await response.json().catch(() => null)) as
    | FirestoreErrorResponse
    | null;
  const status = payload?.error?.status;

  if (status === "ALREADY_EXISTS") {
    return { alreadyRegistered: true };
  }

  throw new FirestoreWaitlistError(
    payload?.error?.message || "Firestore waitlist write failed",
    status,
  );
}

export async function saveToFirestoreWaitlist(
  email: string,
): Promise<{ alreadyRegistered: boolean }> {
  const firestore = await getFirestoreAuth();

  if (!firestore) {
    throw new Error("WAITLIST_FIREBASE_NOT_CONFIGURED");
  }

  try {
    return await writeFirestoreWaitlistDocument(
      firestore.projectId,
      email,
      firestore.auth,
    );
  } catch (error) {
    if (isAlreadyExistsError(error)) {
      return { alreadyRegistered: true };
    }

    throw error;
  }
}

function firestoreString(value: FirestoreValue | undefined) {
  return typeof value?.stringValue === "string" ? value.stringValue : "";
}

function firestoreTimestamp(value: FirestoreValue | undefined) {
  return typeof value?.timestampValue === "string" ? value.timestampValue : "";
}

function documentIdFromName(name: string | undefined) {
  if (!name) return "";
  const encoded = name.split("/").pop() ?? "";

  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}

function waitlistEntryFromFirestoreDocument(
  document: FirestoreDocument,
): WaitlistEntry | null {
  const fields = document.fields ?? {};
  const email =
    firestoreString(fields.Email) ||
    firestoreString(fields.email) ||
    documentIdFromName(document.name);
  const createdAt =
    firestoreTimestamp(fields.CreatedAt) ||
    firestoreTimestamp(fields.createdAt) ||
    document.createTime ||
    document.updateTime ||
    "";

  if (!email) {
    return null;
  }

  return {
    email,
    createdAt,
  };
}

async function readFirestoreWaitlistPage(
  projectId: string,
  auth: FirestoreAuth,
  pageToken?: string,
): Promise<FirestoreListResponse> {
  const databasePath = firestoreDatabasePath(projectId);
  const url = new URL(
    `https://firestore.googleapis.com/v1/${databasePath}/documents/waitlist`,
  );
  const headers: Record<string, string> = {};

  url.searchParams.set("pageSize", "1000");
  if (pageToken) {
    url.searchParams.set("pageToken", pageToken);
  }
  applyFirestoreAuth(url, headers, auth);

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (response.ok) {
    return (await response.json().catch(() => ({}))) as FirestoreListResponse;
  }

  const payload = (await response.json().catch(() => null)) as
    | FirestoreErrorResponse
    | null;

  throw new FirestoreWaitlistError(
    payload?.error?.message || "Firestore waitlist read failed",
    payload?.error?.status,
  );
}

export async function readFirestoreWaitlist(): Promise<WaitlistEntry[]> {
  const firestore = await getFirestoreAuth();

  if (!firestore) {
    throw new Error("WAITLIST_FIREBASE_NOT_CONFIGURED");
  }

  const entries: WaitlistEntry[] = [];
  let pageToken: string | undefined;

  do {
    const page = await readFirestoreWaitlistPage(
      firestore.projectId,
      firestore.auth,
      pageToken,
    );

    entries.push(
      ...(page.documents ?? [])
        .map(waitlistEntryFromFirestoreDocument)
        .filter((entry): entry is WaitlistEntry => entry !== null),
    );
    pageToken = page.nextPageToken;
  } while (pageToken);

  return entries;
}

export async function readLocalWaitlist(): Promise<WaitlistEntry[]> {
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

export async function saveToLocalWaitlist(
  email: string,
): Promise<{ alreadyRegistered: boolean }> {
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
  await fs.writeFile(
    localWaitlistPath,
    `${JSON.stringify(entries, null, 2)}\n`,
    "utf8",
  );

  return { alreadyRegistered: false };
}

export async function readWaitlistEntries(): Promise<{
  entries: WaitlistEntry[];
  storage: WaitlistStorage;
}> {
  if (getFirebaseServiceAccount() || getPublicFirestoreConfig().isConfigured) {
    try {
      return {
        entries: await withTimeout(readFirestoreWaitlist()),
        storage: "firestore",
      };
    } catch (error) {
      if (
        process.env.NODE_ENV !== "production" &&
        (isTimeoutError(error) || isFirestorePermissionError(error))
      ) {
        return {
          entries: await readLocalWaitlist(),
          storage: "local",
        };
      }

      throw error;
    }
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      entries: await readLocalWaitlist(),
      storage: "local",
    };
  }

  throw new Error("WAITLIST_FIREBASE_NOT_CONFIGURED");
}
