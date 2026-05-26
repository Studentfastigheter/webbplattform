import { promises as fs } from "node:fs";
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

class FirestoreWriteError extends Error {
  constructor(
    message: string,
    public readonly status?: string,
  ) {
    super(message);
    this.name = "FirestoreWriteError";
  }
}

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function validateEmail(email: string): string | null {
  if (!email) return "Ange en e-postadress.";
  if (!emailRegex.test(email)) return "Ange en giltig e-postadress.";
  if (email.length > 254) return "E-postadressen är för lång.";
  return null;
}

function getFirestoreConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  return {
    apiKey,
    projectId,
    isConfigured: Boolean(apiKey && projectId),
  };
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

async function saveToFirestoreWaitlist(email: string): Promise<{ alreadyRegistered: boolean }> {
  const { apiKey, projectId, isConfigured } = getFirestoreConfig();

  if (!isConfigured || !apiKey || !projectId) {
    throw new Error("WAITLIST_FIREBASE_NOT_CONFIGURED");
  }

  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/waitlist`,
  );
  url.searchParams.set("documentId", email);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        Email: { stringValue: email },
        CreatedAt: { timestampValue: new Date().toISOString() },
      },
    }),
  });

  if (response.ok) {
    return { alreadyRegistered: false };
  }

  const payload = (await response.json().catch(() => null)) as FirestoreErrorResponse | null;
  const status = payload?.error?.status;

  if (status === "ALREADY_EXISTS") {
    return { alreadyRegistered: true };
  }

  throw new FirestoreWriteError(payload?.error?.message || "Firestore waitlist write failed", status);
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
    if (getFirestoreConfig().isConfigured) {
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
