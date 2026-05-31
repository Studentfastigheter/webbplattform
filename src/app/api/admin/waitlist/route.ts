import { NextResponse } from "next/server";

import { getAuthResponseUser } from "@/features/auth/services/auth-service";
import { apiClient } from "@/lib/api/client";
import { readWaitlistEntries, type WaitlistEntry } from "@/lib/waitlist/store";
import type { AuthResponse } from "@/types";

export const runtime = "nodejs";

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  return match?.[1]?.trim() || "";
}

async function isAdminRequest(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return false;
  }

  try {
    const session = await apiClient<AuthResponse>("/auth/me", {}, token);
    return getAuthResponseUser(session).accountType === "admin";
  } catch {
    return false;
  }
}

function dateKeyFromEntry(entry: WaitlistEntry) {
  const date = new Date(entry.createdAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function dateFromDateKey(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function nextDateKey(dateKey: string) {
  const date = dateFromDateKey(dateKey);

  if (!date) {
    return dateKey;
  }

  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function compareEntriesByCreatedAtDesc(left: WaitlistEntry, right: WaitlistEntry) {
  const leftTime = new Date(left.createdAt).getTime();
  const rightTime = new Date(right.createdAt).getTime();
  const normalizedLeft = Number.isFinite(leftTime) ? leftTime : 0;
  const normalizedRight = Number.isFinite(rightTime) ? rightTime : 0;

  return normalizedRight - normalizedLeft || left.email.localeCompare(right.email);
}

function buildDailyTrend(entries: WaitlistEntry[]) {
  const countByDate = new Map<string, number>();
  let unknownCreatedAtCount = 0;

  entries.forEach((entry) => {
    const dateKey = dateKeyFromEntry(entry);

    if (!dateKey) {
      unknownCreatedAtCount += 1;
      return;
    }

    countByDate.set(dateKey, (countByDate.get(dateKey) ?? 0) + 1);
  });

  const dates = Array.from(countByDate.keys()).sort((left, right) =>
    left.localeCompare(right),
  );
  const firstDate = dates[0];
  const lastDate = dates.at(-1);
  const daily: Array<{ date: string; count: number; cumulative: number }> = [];
  let cumulative = 0;

  if (firstDate && lastDate) {
    let currentDate = firstDate;

    while (currentDate <= lastDate) {
      const count = countByDate.get(currentDate) ?? 0;
      cumulative += count;
      daily.push({
        date: currentDate,
        count,
        cumulative,
      });
      currentDate = nextDateKey(currentDate);
    }
  }

  return {
    daily,
    unknownCreatedAtCount,
  };
}

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Obehörig." }, { status: 401 });
  }

  try {
    const { entries, storage } = await readWaitlistEntries();
    const { daily, unknownCreatedAtCount } = buildDailyTrend(entries);
    const sortedEntries = [...entries].sort(compareEntriesByCreatedAtDesc);

    return NextResponse.json({
      total: entries.length,
      entries: sortedEntries,
      daily,
      unknownCreatedAtCount,
      storage,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Waitlist stats failed", error);
    return NextResponse.json(
      { error: "Kunde inte hämta waitlist-statistik." },
      { status: 500 },
    );
  }
}
