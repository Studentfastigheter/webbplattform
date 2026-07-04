import { describe, expect, it } from "vitest";

import {
  firstFiniteNumber,
  firstNonEmptyString,
  isRecord,
} from "@/lib/api/normalize";

describe("isRecord", () => {
  it("accepterar bara vanliga objekt", () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ a: 1 })).toBe(true);
    expect(isRecord([])).toBe(false);
    expect(isRecord(null)).toBe(false);
    expect(isRecord("x")).toBe(false);
    expect(isRecord(42)).toBe(false);
  });
});

describe("firstNonEmptyString", () => {
  it("returnerar första icke-tomma strängen, trimmad", () => {
    expect(firstNonEmptyString(undefined, "", "  hej  ", "då")).toBe("hej");
  });

  it("hoppar över icke-strängar och whitespace", () => {
    expect(firstNonEmptyString(3, {}, "   ", null)).toBeUndefined();
  });
});

describe("firstFiniteNumber", () => {
  it("koercar strängar med svenskt decimalkomma", () => {
    expect(firstFiniteNumber("12,5")).toBe(12.5);
    expect(firstFiniteNumber("abc", "7")).toBe(7);
  });

  it("returnerar undefined när inget värde är ändligt", () => {
    expect(firstFiniteNumber(undefined, "abc", NaN, Infinity)).toBeUndefined();
  });

  it("behåller historisk Number-koercion: null och tom sträng blir 0", () => {
    expect(firstFiniteNumber(null)).toBe(0);
    expect(firstFiniteNumber("")).toBe(0);
  });
});
