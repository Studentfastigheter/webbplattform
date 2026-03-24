import type { MetricKey, DataPoint, ChartRow } from "./vacancy-graph.types";

export const MOCK_TODAY = new Date(Date.UTC(2026, 2, 21)); // 2026-03-21

function parseISODateUTC(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toISODateUTC(date: Date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function formatMonthDayUTC(date: Date) {
  return `${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate()
  ).padStart(2, "0")}`;
}

function getDaysInYearUTC(year: number) {
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  return Math.round((end - start) / 86400000);
}

function generateDatesForYearUTC(year: number) {
  const days = getDaysInYearUTC(year);
  const result: Date[] = [];

  for (let i = 0; i < days; i++) {
    result.push(new Date(Date.UTC(year, 0, 1 + i)));
  }

  return result;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// seedad pseudo-random så att server + klient får samma data
function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return function random() {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function generateMetricSeries(
  year: number,
  startValue: number,
  volatility: number,
  min = 0,
  max = 1000,
  seed = 1,
  options?: {
    stopAtToday?: boolean;
    today?: Date;
  }
): DataPoint[] {
  const today = options?.today ?? MOCK_TODAY;
  const stopAtToday = options?.stopAtToday ?? false;
  const random = createSeededRandom(seed);

  const allDates = generateDatesForYearUTC(year);

  const dates = stopAtToday
    ? allDates.filter((date) => date.getTime() <= today.getTime())
    : allDates;

  const totalDaysInYear = getDaysInYearUTC(year);
  const data: DataPoint[] = [];
  let value = startValue;

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];

    const seasonal =
      Math.sin((i / totalDaysInYear) * Math.PI * 2) * volatility * 0.8;
    const drift = (random() - 0.5) * volatility;

    value = clamp(value + drift + seasonal * 0.03, min, max);

    data.push({
      date: toISODateUTC(date),
      value: Math.round(value),
    });
  }

  return data;
}

export function buildComparisonData(
  thisYearRaw: DataPoint[],
  lastYearRaw: DataPoint[],
  thisYear: number
): ChartRow[] {
  const thisYearMap = new Map<string, number>();
  const lastYearMonthDayMap = new Map<string, number>();

  for (const point of thisYearRaw) {
    thisYearMap.set(point.date, point.value);
  }

  for (const point of lastYearRaw) {
    const d = parseISODateUTC(point.date);
    lastYearMonthDayMap.set(formatMonthDayUTC(d), point.value);
  }

  return generateDatesForYearUTC(thisYear).map((date) => {
    const displayDate = toISODateUTC(date);
    const monthDay = formatMonthDayUTC(date);

    return {
      date: displayDate,
      thisYear: thisYearMap.get(displayDate) ?? null,
      lastYear: lastYearMonthDayMap.get(monthDay) ?? null,
    };
  });
}

export function getDisplayTotals(rows: ChartRow[], today: Date) {
  const todayMonthDay = formatMonthDayUTC(today);

  const totals = rows.reduce(
    (acc, row) => {
      const rowDate = parseISODateUTC(row.date);
      const rowMonthDay = formatMonthDayUTC(rowDate);
      const isToToday = rowMonthDay <= todayMonthDay;

      const thisYearVal = row.thisYear ?? 0;
      const lastYearVal = row.lastYear ?? 0;

      acc.full.thisYear += thisYearVal;
      acc.full.lastYear += lastYearVal;

      if (isToToday) {
        acc.toDate.thisYear += thisYearVal;
        acc.toDate.lastYear += lastYearVal;
      }

      return acc;
    },
    {
      toDate: { thisYear: 0, lastYear: 0 },
      full: { thisYear: 0, lastYear: 0 },
    }
  );

  const difference = totals.toDate.thisYear - totals.toDate.lastYear;

  const percentChange =
    totals.toDate.lastYear === 0
      ? null
      : (difference / totals.toDate.lastYear) * 100;

  return {
    ...totals,
    comparison: {
      difference,
      percentChange: percentChange && Math.round(percentChange * 10) / 10,
      isUp: difference > 0,
      isDown: difference < 0,
      isEqual: difference === 0,
    },
  };
}

export function createMetricSourceData(today: Date): Record<
  MetricKey,
  { lastYear: DataPoint[]; thisYear: DataPoint[] }
> {
  const currentYear = today.getUTCFullYear();
  const previousYear = currentYear - 1;

  return {
    views: {
      lastYear: generateMetricSeries(previousYear, 280, 35, 80, 700, 101, {
        stopAtToday: false,
        today,
      }),
      thisYear: generateMetricSeries(currentYear, 340, 45, 100, 900, 102, {
        stopAtToday: true,
        today,
      }),
    },
    applications: {
      lastYear: generateMetricSeries(previousYear, 18, 6, 0, 80, 201, {
        stopAtToday: false,
        today,
      }),
      thisYear: generateMetricSeries(currentYear, 24, 7, 0, 100, 202, {
        stopAtToday: true,
        today,
      }),
    },
    vacancies: {
      lastYear: generateMetricSeries(previousYear, 5, 2, 0, 10, 80, {
        stopAtToday: false,
        today,
      }),
      thisYear: generateMetricSeries(currentYear, 7, 3, 0, 5, 50, {
        stopAtToday: true,
        today,
      }),
    },
  };
}

export function groupComparisonDataByMonth(rows: ChartRow[]): ChartRow[] {
  const monthMap = new Map<
    string,
    { thisYear: number; lastYear: number; hasThisYear: boolean; hasLastYear: boolean }
  >();

  for (const row of rows) {
    const date = parseISODateUTC(row.date);
    const monthDate = `${date.getUTCFullYear()}-${String(
      date.getUTCMonth() + 1
    ).padStart(2, "0")}-01`;

    if (!monthMap.has(monthDate)) {
      monthMap.set(monthDate, {
        thisYear: 0,
        lastYear: 0,
        hasThisYear: false,
        hasLastYear: false,
      });
    }

    const month = monthMap.get(monthDate)!;

    if (row.thisYear != null) {
      month.thisYear += row.thisYear;
      month.hasThisYear = true;
    }

    if (row.lastYear != null) {
      month.lastYear += row.lastYear;
      month.hasLastYear = true;
    }
  }

  return Array.from(monthMap.entries()).map(([date, values]) => ({
    date,
    thisYear: values.hasThisYear ? values.thisYear : null,
    lastYear: values.hasLastYear ? values.lastYear : null,
  }));
}

export { parseISODateUTC };