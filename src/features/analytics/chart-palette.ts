/**
 * Gemensam diagrampalett för portalens analytics, förankrad i CampusLyans
 * brand-tokens (globals.css @theme). Ersätter TailAdmin-indigon (#465fff),
 * den rosa trendlinjen och tre kopierade kategoriska arrayer.
 *
 * Riktlinjer:
 * - Huvudserie i staplar/linjer: CHART_PRIMARY (brand-600).
 * - Jämförelse-/sekundärserie: CHART_MUTED (brand-100) eller CHART_COMPARISON.
 * - Kategoriska data: CHART_CATEGORICAL i ordning (börjar i varumärkesgrönt,
 *   roterar genom väl separerade dämpade kulörer som fungerar mot vitt).
 */

export const CHART_PRIMARY = "#0a7a4a"; // brand-600
export const CHART_PRIMARY_DEEP = "#004225"; // brand-500 — betoning/aktiv
export const CHART_MUTED = "#cce8d8"; // brand-100 — sekundär stapel
export const CHART_COMPARISON = "#3b82f6"; // kontrastserie vid tvåserier
export const CHART_GRID = "#e5e7eb";
export const CHART_TICK = "#6b7280";

export const CHART_CATEGORICAL = [
  "#0a7a4a", // varumärkesgrön (brand-600)
  "#3b82f6", // blå
  "#d97706", // bärnsten
  "#7c6bd6", // viol
  "#0d9488", // teal
  "#b45309", // rost
  "#64748b", // skiffer
  "#9fd0b6", // ljusgrön (brand-200)
] as const;

export function categoricalColor(index: number): string {
  return CHART_CATEGORICAL[index % CHART_CATEGORICAL.length];
}
