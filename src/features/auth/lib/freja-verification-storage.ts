import type { User } from "@/types";

const QUICK_REGISTER_AUTH_REF_PREFIX =
  "campuslyan.freja.quickRegisterAuthRef";

type FrejaAuthRefResponse = {
  authRef: string;
};

const quickRegisterStartRequests = new Map<
  string,
  Promise<FrejaAuthRefResponse>
>();

function getQuickRegisterAuthRefKey(
  user: Pick<User, "id" | "email"> | null | undefined
) {
  const identity = user?.email?.trim() || String(user?.id ?? "").trim();

  if (!identity) {
    return null;
  }

  return encodeURIComponent(identity.toLowerCase());
}

function getQuickRegisterAuthRefStorageKey(
  user: Pick<User, "id" | "email"> | null | undefined
) {
  const key = getQuickRegisterAuthRefKey(user);
  return key ? `${QUICK_REGISTER_AUTH_REF_PREFIX}:${key}` : null;
}

export function readQuickRegisterAuthRef(
  user: Pick<User, "id" | "email"> | null | undefined
) {
  if (typeof window === "undefined") {
    return null;
  }

  const key = getQuickRegisterAuthRefStorageKey(user);
  if (!key) {
    return null;
  }

  const stored = window.localStorage.getItem(key);
  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as { authRef?: unknown };
    return typeof parsed.authRef === "string" && parsed.authRef.trim()
      ? parsed.authRef.trim()
      : null;
  } catch {
    return stored.trim() || null;
  }
}

export function writeQuickRegisterAuthRef(
  user: Pick<User, "id" | "email"> | null | undefined,
  authRef: string
) {
  if (typeof window === "undefined") {
    return;
  }

  const key = getQuickRegisterAuthRefStorageKey(user);
  const normalizedAuthRef = authRef.trim();

  if (!key || !normalizedAuthRef) {
    return;
  }

  window.localStorage.setItem(
    key,
    JSON.stringify({
      authRef: normalizedAuthRef,
      createdAt: new Date().toISOString(),
    })
  );
}

export function clearQuickRegisterAuthRef(
  user: Pick<User, "id" | "email"> | null | undefined
) {
  const cacheKey = getQuickRegisterAuthRefKey(user);
  if (cacheKey) {
    quickRegisterStartRequests.delete(cacheKey);
  }

  if (typeof window === "undefined") {
    return;
  }

  const key = getQuickRegisterAuthRefStorageKey(user);
  if (key) {
    window.localStorage.removeItem(key);
  }
}

export async function startOrResumeQuickRegisterVerification(
  user: Pick<User, "id" | "email"> | null | undefined,
  startVerification: () => Promise<FrejaAuthRefResponse>
) {
  const storedAuthRef = readQuickRegisterAuthRef(user);
  if (storedAuthRef) {
    return { authRef: storedAuthRef };
  }

  const key = getQuickRegisterAuthRefKey(user);
  if (!key) {
    return startVerification();
  }

  const existingRequest = quickRegisterStartRequests.get(key);
  if (existingRequest) {
    return existingRequest;
  }

  const request = startVerification()
    .then((response) => {
      writeQuickRegisterAuthRef(user, response.authRef);
      return response;
    })
    .catch((error) => {
      quickRegisterStartRequests.delete(key);
      throw error;
    });

  quickRegisterStartRequests.set(key, request);
  return request;
}
