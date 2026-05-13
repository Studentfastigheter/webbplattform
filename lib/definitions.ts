export type SessionPayload = {
  userId: string;
  expiresAt: Date;
};

export type SkeletonWrapperProps = {
    gap: "sm" | "md" | "lg";
    count: number;
    children: React.ReactNode;
}

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
