"use client";

import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type FilterSectionShellProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  withBorder?: boolean;
  className?: string;
};

const FilterSectionShell: React.FC<FilterSectionShellProps> = ({
  title,
  description,
  children,
  withBorder = true,
  className = "",
}) => {
  return (
    <section
      className={cn(
        "py-4 sm:py-5",
        withBorder && "border-b border-black/10",
        className
      )}
    >
      {(title || description) && (
        <div className="mb-3">
          {title && (
            <h3 className="text-sm font-semibold leading-5 text-black">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm leading-5 text-black/60">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};

export default FilterSectionShell;
