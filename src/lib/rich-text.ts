const RICH_TEXT_PREFIX = "clrt:v1:";

const RICH_TEXT_FIELD_NAMES = new Set([
  "aboutText",
  "about_text",
  "bodyText",
  "body_text",
  "caption",
  "companyDescription",
  "company_description",
  "contactNote",
  "contact_note",
  "contentText",
  "content_text",
  "description",
  "details",
  "internalContactNote",
  "internal_contact_note",
  "message",
  "note",
  "notes",
  "subtitle",
  "text",
]);

type BufferConstructorLike = {
  from(input: Uint8Array): { toString(encoding: string): string };
  from(input: string, encoding: string): Uint8Array;
};

function getBuffer(): BufferConstructorLike | undefined {
  return (globalThis as typeof globalThis & { Buffer?: BufferConstructorLike })
    .Buffer;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  const buffer = getBuffer();
  const base64 = buffer
    ? buffer.from(bytes).toString("base64")
    : (() => {
        let binary = "";
        bytes.forEach((byte) => {
          binary += String.fromCharCode(byte);
        });

        return btoa(binary);
      })();

  return base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const buffer = getBuffer();

  if (buffer) {
    return new Uint8Array(buffer.from(base64, "base64"));
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isEncodedRichText(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(RICH_TEXT_PREFIX);
}

export function encodeRichText(value: string): string {
  if (!value || value.startsWith(RICH_TEXT_PREFIX)) {
    return value;
  }

  const bytes = new TextEncoder().encode(value.normalize("NFC"));
  return `${RICH_TEXT_PREFIX}${bytesToBase64Url(bytes)}`;
}

export function decodeRichText(value: string): string {
  if (!isEncodedRichText(value)) {
    return value;
  }

  try {
    const encoded = value.slice(RICH_TEXT_PREFIX.length);
    return new TextDecoder().decode(base64UrlToBytes(encoded));
  } catch {
    return value;
  }
}

export function shouldEncodeRichTextField(key: string): boolean {
  return RICH_TEXT_FIELD_NAMES.has(key);
}

export function encodeRichTextPayload<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => encodeRichTextPayload(item)) as T;
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => {
      if (typeof entryValue === "string" && shouldEncodeRichTextField(key)) {
        return [key, encodeRichText(entryValue)];
      }

      return [key, encodeRichTextPayload(entryValue)];
    })
  ) as T;
}

export function decodeRichTextPayload<T>(value: T): T {
  if (typeof value === "string") {
    return decodeRichText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => decodeRichTextPayload(item)) as T;
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => [
      key,
      decodeRichTextPayload(entryValue),
    ])
  ) as T;
}
