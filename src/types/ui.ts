import type { ReactNode } from "react";

export type SkeletonWrapperProps = {
  gap: "sm" | "md" | "lg";
  count: number;
  children: ReactNode;
};

export type ChartRow = {
  date: string;
  thisYear: number | null;
  lastYear: number | null;
};
