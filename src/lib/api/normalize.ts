/**
 * Delade normaliseringshelpers för feature-services som översätter okända
 * backend-svar till typade DTO:er. Tidigare kopierades dessa mellan 8+
 * services med små divergenser — services med avvikande semantik (t.ex.
 * auth-service:s striktare firstNumber utan kommatecken-koercion) behåller
 * medvetet sina lokala varianter.
 */

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Första icke-tomma strängen bland värdena, trimmad. */
export const firstNonEmptyString = (...values: unknown[]): string | undefined =>
  values
    .find(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0
    )
    ?.trim();

/**
 * Första värdet som går att koerca till ett ändligt tal. Strängar tillåter
 * svenskt decimalkomma ("12,5"). OBS: Number-koercionen ger 0 för null och
 * tom sträng — det är historiskt beteende som konsumenterna förlitar sig på.
 */
export function firstFiniteNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const numberValue =
      typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);

    if (Number.isFinite(numberValue)) {
      return numberValue;
    }
  }

  return undefined;
}
