"use client";

import * as React from "react";
import {
  AnalyticsBlock,
  AnalyticsGrid,
  useAnalyticsBlock,
  type AnalyticsBlockColumns,
  type AnalyticsBlockContextValue,
  type AnalyticsBlockProps,
  type AnalyticsBlockRows,
  type AnalyticsBlockSize,
} from "@/features/analytics/components/AnalyticsBlocks";
import { cn } from "@/lib/utils";

export type PortalGridColumns = AnalyticsBlockColumns;
export type PortalGridRows = AnalyticsBlockRows;
export type PortalGridItemSize = AnalyticsBlockSize;
export type PortalGridItemContextValue = AnalyticsBlockContextValue;
export type PortalGridProps = React.ComponentProps<typeof AnalyticsGrid>;
export type PortalGridItemProps = AnalyticsBlockProps;

type PortalSurfacePadding = "none" | "sm" | "md" | "lg";

type PortalSurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  dashed?: boolean;
  padding?: PortalSurfacePadding;
};

type PortalPageProps = React.HTMLAttributes<HTMLDivElement>;

type PortalEmptyStateProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  action?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  title: React.ReactNode;
};

const surfacePaddingClassName: Record<PortalSurfacePadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function PortalPage({ className, ...props }: PortalPageProps) {
  return <div className={cn("space-y-6", className)} {...props} />;
}

export function PortalGrid(props: PortalGridProps) {
  return <AnalyticsGrid {...props} />;
}

export function PortalGridItem(props: PortalGridItemProps) {
  return <AnalyticsBlock {...props} />;
}

export const PortalBlock = PortalGridItem;

export function usePortalGridItem() {
  return useAnalyticsBlock();
}

export function PortalSurface({
  className,
  dashed = false,
  padding = "md",
  ...props
}: PortalSurfaceProps) {
  return (
    <div
      className={cn(
        "portal-surface min-w-0",
        dashed && "border-dashed",
        surfacePaddingClassName[padding],
        className
      )}
      {...props}
    />
  );
}

export function PortalEmptyState({
  action,
  className,
  description,
  icon,
  title,
  ...props
}: PortalEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] min-w-0 flex-col items-center justify-center text-center",
        className
      )}
      {...props}
    >
      {icon ? (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700">
          {icon}
        </div>
      ) : null}
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-md text-sm leading-6 text-gray-500">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
