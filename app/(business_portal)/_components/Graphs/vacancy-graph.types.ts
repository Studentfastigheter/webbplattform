export type MetricKey = "views" | "applications" | "vacancies";

export type DataPoint = {
  date: string;
  value: number;
};

export type ChartRow = {
  date: string;
  thisYear: number | null;
  lastYear: number | null;
};