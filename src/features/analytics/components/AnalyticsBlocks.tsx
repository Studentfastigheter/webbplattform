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
  1: "xl:row-span-1",
  2: "xl:row-span-2",
  3: "xl:row-span-3",
  4: "xl:row-span-4",
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
  rowHeightClassName = "xl:auto-rows-[minmax(var(--analytics-block-unit),auto)]",
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
        "grid min-w-0 grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:[grid-auto-flow:dense]",
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
          "portal-surface flex min-h-0 min-w-0 flex-col overflow-hidden text-gray-800",
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
          <div className="flex min-h-[64px] min-w-0 flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b border-gray-100 px-5 py-4 sm:items-start sm:px-6">
            <div className="min-w-0 flex-1 basis-[180px]">
              {title ? (
                <h2 className="text-[15px] font-semibold leading-6 text-gray-900">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="mt-1 line-clamp-2 text-theme-sm leading-5 text-gray-500">
                  {description}
                </p>
              ) : null}
            </div>
            {action ? <div className="max-w-full overflow-x-auto">{action}</div> : null}
          </div>
        ) : null}

        <div
          className={cn(
            "min-h-0 min-w-0 flex-1 bg-white",
            "p-5 sm:p-6",
            contentClassName
          )}
        >
          {children}
        </div>
      </section>
    </AnalyticsBlockContext.Provider>
  );
}
