import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export const runtime = "nodejs";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const localWaitlistPath = path.join(process.cwd(), "data", "waitlist.local.json");

type WaitlistRequest = {
  email?: unknown;
};

type LocalWaitlistEntry = {
  email: string;
  createdAt: string;
};

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function validateEmail(email: string): string | null {
  if (!email) return "Ange en e-postadress.";
  if (!emailRegex.test(email)) return "Ange en giltig e-postadress.";
  if (email.length > 254) return "E-postadressen är för lång.";
  return null;
}

function getFirebaseErrorCode(error: unknown): string {
  return typeof error === "object" && error && "code" in error
    ? String((error as { code: unknown }).code)
    : "";
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
    if (isFirebaseConfigured && db) {
      const waitlistDoc = doc(db, "waitlist", encodeURIComponent(email));
      try {
        // Use deterministic doc ids and let Firestore rules handle create-only semantics.
        await setDoc(waitlistDoc, {
          Email: email,
          CreatedAt: serverTimestamp(),
        });

        return NextResponse.json({ ok: true, alreadyRegistered: false });
      } catch (error) {
        if (getFirebaseErrorCode(error) === "permission-denied") {
          return NextResponse.json({ ok: true, alreadyRegistered: true });
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
