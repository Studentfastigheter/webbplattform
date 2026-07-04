import { describe, expect, it } from "vitest";

import {
  arrayFromApiResponse,
  buildQuery,
  normalizeApiBase,
  normalizeAuthToken,
  pathSegment,
} from "@/lib/api/client";

describe("normalizeApiBase", () => {
  it("lägger till /api och tar bort avslutande snedstreck", () => {
    expect(normalizeApiBase("https://api.example.com/")).toBe(
      "https://api.example.com/api"
    );
    expect(normalizeApiBase("https://api.example.com/api")).toBe(
      "https://api.example.com/api"
    );
    expect(normalizeApiBase("  https://api.example.com//  ")).toBe(
      "https://api.example.com/api"
    );
  });
});

describe("normalizeAuthToken", () => {
  it("trimmar och tar bort Bearer-prefix", () => {
    expect(normalizeAuthToken("  Bearer abc123  ")).toBe("abc123");
    expect(normalizeAuthToken("abc123")).toBe("abc123");
  });

  it("avvisar tomma värden och strängarna 'null'/'undefined'", () => {
    expect(normalizeAuthToken("")).toBeNull();
    expect(normalizeAuthToken("null")).toBeNull();
    expect(normalizeAuthToken("undefined")).toBeNull();
    expect(normalizeAuthToken("Bearer ")).toBeNull();
    expect(normalizeAuthToken(42)).toBeNull();
    expect(normalizeAuthToken(null)).toBeNull();
  });
});

describe("buildQuery", () => {
  it("bygger querystring och hoppar över tomma värden", () => {
    expect(buildQuery({ page: 1, size: 20, q: "", skip: undefined, n: null })).toBe(
      "?page=1&size=20"
    );
  });

  it("hanterar arrayvärden som upprepade parametrar", () => {
    expect(buildQuery({ tag: ["a", "b"] })).toBe("?tag=a&tag=b");
  });

  it("returnerar tom sträng när inget finns att skicka", () => {
    expect(buildQuery({})).toBe("");
  });

  it("URL-kodar värden", () => {
    expect(buildQuery({ city: "Växjö & Kalmar" })).toBe(
      "?city=V%C3%A4xj%C3%B6+%26+Kalmar"
    );
  });
});

describe("pathSegment", () => {
  it("URL-kodar path-segment så injection i sökvägar stoppas", () => {
    expect(pathSegment("abc/../admin")).toBe("abc%2F..%2Fadmin");
    expect(pathSegment(42)).toBe("42");
  });
});

describe("arrayFromApiResponse", () => {
  it("returnerar arrayer som de är", () => {
    expect(arrayFromApiResponse([1, 2])).toEqual([1, 2]);
  });

  it("plockar ut nested content/items/data/results", () => {
    expect(arrayFromApiResponse({ content: [1] })).toEqual([1]);
    expect(arrayFromApiResponse({ items: [2] })).toEqual([2]);
    expect(arrayFromApiResponse({ data: [3] })).toEqual([3]);
    expect(arrayFromApiResponse({ results: [4] })).toEqual([4]);
  });

  it("faller tillbaka till tom array för allt annat", () => {
    expect(arrayFromApiResponse(null)).toEqual([]);
    expect(arrayFromApiResponse("text")).toEqual([]);
    expect(arrayFromApiResponse({ other: [1] })).toEqual([]);
  });
});
