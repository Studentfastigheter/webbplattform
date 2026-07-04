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

// Enkel rate limit per IP (fast fönster). In-memory: skyddar per
// serverinstans, vilket räcker som friktion mot skript-spam på en publik
// skrivendpoint. Byt till KV/Upstash om plattformen skalar till många
// instanser och det behöver vara globalt.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_MAX_TRACKED_IPS = 10_000;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip);

  if (!bucket || bucket.resetAt <= now) {
    if (rateLimitBuckets.size >= RATE_LIMIT_MAX_TRACKED_IPS) {
      for (const [key, value] of rateLimitBuckets) {
        if (value.resetAt <= now) rateLimitBuckets.delete(key);
      }

      if (rateLimitBuckets.size >= RATE_LIMIT_MAX_TRACKED_IPS) {
        rateLimitBuckets.clear();
      }
    }

    rateLimitBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX_REQUESTS;
}

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
  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json(
      { error: "För många försök. Vänta en stund och prova igen." },
      { status: 429 },
    );
  }

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
