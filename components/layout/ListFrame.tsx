"use client";

import React from "react";
import clsx from "clsx";

export type ListFrameColumn = {
  id: string;
  label: string;
  align?: "left" | "center" | "right";
  // Optional: control column width in the grid (e.g. "2fr" or "160px")
  width?: string;
  // Optional: margin to the right of the header/column (e.g. "12px" or 12)
  marginRight?: string | number;
  className?: string;
};

export type ListFrameRow = {
  id: string | number;
  cells: React.ReactNode[];
  className?: string;
};

export type ListFrameProps = {
  columns: ListFrameColumn[];
  rows?: ListFrameRow[];
  children?: React.ReactNode; // fallback/custom body
  emptyState?: React.ReactNode;
  className?: string;
};

const ListFrame: React.FC<ListFrameProps> = ({
  columns,
  rows,
  children,
  emptyState,
  className,
}) => {
  const gridTemplateColumns = columns
    .map((col) => col.width ?? "minmax(0, 1fr)")
    .join(" ");
  const hasRows = Array.isArray(rows) && rows.length > 0;
  const hasChildren = React.Children.count(children) > 0;

  return (
    <section
      className={clsx(
        "w-full max-w-[1200px] rounded-2xl bg-white shadow-md",
        "border border-[#F0F0F0]",
        className
      )}
    >
      <header
        className={clsx(
          "px-8",
          "py-4",
          "text-[14px] leading-4 text-black",
          "grid items-center gap-4"
        )}
        style={{ gridTemplateColumns }}
      >
        {columns.map((col) => (
          <span
            key={col.id}
            className={clsx(
              "font-normal",
              col.align === "center" && "text-center",
              col.align === "right" && "text-right",
              col.className
            )}
            style={{
              marginRight:
                col.marginRight === undefined ? undefined : col.marginRight,
            }}
          >
            {col.label}
          </span>
        ))}
      </header>

      <div className="mx-8 h-px bg-[#D9D9D9]" />

      <div className="py-2">
        {hasRows ? (
          <div className="divide-y divide-[#EDEDED]">
            {rows?.map((row) => (
              <div
                key={row.id}
                className={clsx(
                  "grid items-start gap-4 px-8 py-3",
                  row.className
                )}
                style={{ gridTemplateColumns }}
              >
                {row.cells.map((cell, idx) => (
                  <div
                    key={`${row.id}-${columns[idx]?.id ?? idx}`}
                    className={clsx(
                      "h-full",
                      columns[idx]?.align === "center" && "text-center",
                      columns[idx]?.align === "right" && "text-right",
                      columns[idx]?.className
                    )}
                  >
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : hasChildren ? (
          <div className="px-8 py-6">{children}</div>
        ) : (
          <div className="py-12 text-center text-sm text-gray-500">
            {emptyState ?? "Inga objekt att visa"}
          </div>
        )}
      </div>
    </section>
  );
};

export default ListFrame;
