import { describe, expect, it } from "vitest";

import {
  decodeRichText,
  decodeRichTextPayload,
  isEncodedRichText,
} from "@/lib/rich-text";

// Bygger en legacy-blob på samma sätt som den borttagna skrivvägen gjorde,
// så att testet bevisar att gammal data i databasen fortfarande kan läsas.
function legacyEncode(value: string): string {
  const base64 = Buffer.from(new TextEncoder().encode(value.normalize("NFC")))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `clrt:v1:${base64}`;
}

describe("decodeRichText", () => {
  it("avkodar en legacy clrt:v1-blob till ursprunglig text", () => {
    const original = "Rymlig 2:a nära campus.\n\nHör av dig — åäö fungerar!";
    expect(decodeRichText(legacyEncode(original))).toBe(original);
  });

  it("släpper igenom vanlig text oförändrad", () => {
    expect(decodeRichText("Vanlig beskrivning utan kodning")).toBe(
      "Vanlig beskrivning utan kodning"
    );
  });

  it("returnerar värdet oförändrat om base64-delen är trasig", () => {
    expect(decodeRichText("clrt:v1:!!!inte-base64!!!")).toBe(
      "clrt:v1:!!!inte-base64!!!"
    );
  });
});

describe("isEncodedRichText", () => {
  it("känner igen prefixet och avvisar allt annat", () => {
    expect(isEncodedRichText(legacyEncode("x"))).toBe(true);
    expect(isEncodedRichText("clrt:v2:framtida")).toBe(false);
    expect(isEncodedRichText("text")).toBe(false);
    expect(isEncodedRichText(null)).toBe(false);
    expect(isEncodedRichText(42)).toBe(false);
  });
});

describe("decodeRichTextPayload", () => {
  it("avkodar rekursivt i objekt och arrayer men rör inget annat", () => {
    const payload = {
      id: 7,
      description: legacyEncode("Beskrivning"),
      nested: {
        items: [
          { note: legacyEncode("Rad 1") },
          { note: "redan ren text" },
        ],
      },
    };

    expect(decodeRichTextPayload(payload)).toEqual({
      id: 7,
      description: "Beskrivning",
      nested: {
        items: [{ note: "Rad 1" }, { note: "redan ren text" }],
      },
    });
  });
});
