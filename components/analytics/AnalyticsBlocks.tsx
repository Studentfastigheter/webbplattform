"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type AnalyticsBlockColumns = 1 | 2 | 3 | 4;
type AnalyticsBlockRows = 1 | 2 | 3 | 4;

export type AnalyticsBlockSize =
  `${AnalyticsBlockRows}x${AnalyticsBlockColumns}`;

type AnalyticsBlockContextValue = {
  rows: AnalyticsBlockRows;
  columns: AnalyticsBlockColumns;
  size: AnalyticsBlockSize;
};

type AnalyticsGridProps = React.ComponentProps<"div"> & {
  rowHeightClassName?: string;
};

type AnalyticsBlockProps = Omit<React.ComponentProps<"section">, "title"> & {
  size?: AnalyticsBlockSize;
  rowSpan?: AnalyticsBlockRows;
  colSpan?: AnalyticsBlockColumns;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  contentClassName?: string;
};

const AnalyticsBlockContext =
  React.createContext<AnalyticsBlockContextValue | null>(null);

const colSpanClass: Record<AnalyticsBlockColumns, string> = {
  1: "sm:col-span-1 xl:col-span-1",
  2: "sm:col-span-2 xl:col-span-2",
  3: "sm:col-span-2 xl:col-span-3",
  4: "sm:col-span-2 xl:col-span-4",
};

const rowSpanClass: Record<AnalyticsBlockRows, string> = {
  1: "row-span-1",
  2: "row-span-2",
  3: "row-span-3",
  4: "row-span-4",
};

function isAnalyticsBlockColumn(value: number): value is AnalyticsBlockColumns {
  return Number.isInteger(value) && value >= 1 && value <= 4;
}

function isAnalyticsBlockRow(value: number): value is AnalyticsBlockRows {
  return Number.isInteger(value) && value >= 1 && value <= 4;
}

function parseSize(size: AnalyticsBlockSize | undefined) {
  if (!size) {
    return { rows: 1, columns: 1 } satisfies {
      rows: AnalyticsBlockRows;
      columns: AnalyticsBlockColumns;
    };
  }

  const [rawRows, rawColumns] = size.split("x").map(Number);
  const rows = isAnalyticsBlockRow(rawRows) ? rawRows : 1;
  const columns = isAnalyticsBlockColumn(rawColumns) ? rawColumns : 1;

  return { rows, columns };
}

function toSize(rows: AnalyticsBlockRows, columns: AnalyticsBlockColumns) {
  return `${rows}x${columns}` as AnalyticsBlockSize;
}

export function useAnalyticsBlock() {
  return React.useContext(AnalyticsBlockContext);
}

export function AnalyticsGrid({
  className,
  rowHeightClassName = "auto-rows-[var(--analytics-block-unit)]",
  style,
  ...props
}: AnalyticsGridProps) {
  const gridRef = React.useRef<HTMLDivElement>(null);
  const [unitSize, setUnitSize] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    const grid = gridRef.current;

    if (!grid) {
      return;
    }

    const updateUnitSize = () => {
      const styles = window.getComputedStyle(grid);
      const columns = styles.gridTemplateColumns
        .split(" ")
        .filter(Boolean).length;
      const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;

      if (columns <= 0 || grid.clientWidth <= 0) {
        return;
      }

      const columnWidth = (grid.clientWidth - gap * (columns - 1)) / columns;
      setUnitSize(columnWidth / 2);
    };

    updateUnitSize();

    const observer = new ResizeObserver(updateUnitSize);
    observer.observe(grid);

    return () => observer.disconnect();
  }, []);

  const gridStyle = {
    ...style,
    "--analytics-block-unit": unitSize ? `${unitSize}px` : "90px",
  } as React.CSSProperties & { "--analytics-block-unit": string };

  return (
    <div
      ref={gridRef}
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
        rowHeightClassName,
        className
      )}
      style={gridStyle}
      {...props}
    />
  );
}

export function AnalyticsBlock({
  size,
  rowSpan,
  colSpan,
  title,
  description,
  action,
  className,
  contentClassName,
  children,
  ...props
}: AnalyticsBlockProps) {
  const parsedSize = parseSize(size);
  const rows = rowSpan ?? parsedSize.rows;
  const columns = colSpan ?? parsedSize.columns;
  const resolvedSize = toSize(rows, columns);
  const hasHeader = Boolean(title || description || action);

  return (
    <AnalyticsBlockContext.Provider value={{ rows, columns, size: resolvedSize }}>
      <section
        className={cn(
          "flex min-h-0 flex-col overflow-hidden rounded-[20px] border border-[#eceef2] bg-white text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.10)]",
          colSpanClass[columns],
          rowSpanClass[rows],
          className
        )}
        data-analytics-block-size={resolvedSize}
        data-analytics-block-columns={columns}
        data-analytics-block-rows={rows}
        {...props}
      >
        {hasHeader ? (
          <div className="flex min-h-[64px] items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              {title ? (
                <h2 className="truncate text-base font-semibold leading-6 text-[#111827]">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#6b7280]">
                  {description}
                </p>
              ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
        ) : null}

        <div
          className={cn(
            "min-h-0 flex-1 bg-white",
            hasHeader ? "px-5 pb-5 pt-1" : "p-5",
            contentClassName
          )}
        >
          {children}
        </div>
      </section>
    </AnalyticsBlockContext.Provider>
  );
}
