/**
 * Historik: apiClient base64url-kodade tidigare ett antal fritextfält till
 * "clrt:v1:<base64>"-blobbar i varje request (utan att backend kände till
 * det). Kodningen på SKRIVVÄGEN är borttagen — ny data sparas som ren text —
 * men avkodningen på LÄSVÄGEN behålls så att äldre blobbar som redan ligger
 * i databasen fortfarande renderas korrekt. Ta inte bort avkodningen förrän
 * datat är migrerat.
 */

const RICH_TEXT_PREFIX = "clrt:v1:";

type BufferConstructorLike = {
  from(input: Uint8Array): { toString(encoding: string): string };
  from(input: string, encoding: string): Uint8Array;
};

function getBuffer(): BufferConstructorLike | undefined {
  return (globalThis as typeof globalThis & { Buffer?: BufferConstructorLike })
    .Buffer;
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

export function decodeRichText(value: string): string {
  if (!isEncodedRichText(value)) {
    return value;
  }

  const encoded = value.slice(RICH_TEXT_PREFIX.length);

  // Buffer.from/atob kastar inte på ogiltig base64 utan hoppar tyst över
  // ogiltiga tecken — validera teckenmängden själva och kräv strikt UTF-8,
  // annars returneras hellre originalvärdet än mojibake.
  if (!/^[A-Za-z0-9_-]*$/.test(encoded)) {
    return value;
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(
      base64UrlToBytes(encoded)
    );
  } catch {
    return value;
  }
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
