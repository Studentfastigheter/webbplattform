import { NextResponse } from "next/server";

import {
  getFirebaseServiceAccount,
  getPublicFirestoreConfig,
  isFirestorePermissionError,
  isTimeoutError,
  saveToFirestoreWaitlist,
  saveToLocalWaitlist,
  withTimeout,
} from "@/lib/waitlist/store";

export const runtime = "nodejs";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type WaitlistRequest = {
  email?: unknown;
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
        const firestoreResult = await withTimeout(saveToFirestoreWaitlist(email));
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
