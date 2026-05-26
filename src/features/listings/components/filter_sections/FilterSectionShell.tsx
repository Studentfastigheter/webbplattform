"use client";

import React, { type ReactNode } from "react";

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
      className={`py-5 ${withBorder ? "border-b border-black/10" : ""} ${className}`}
    >
      {(title || description) && (
        <div className="mb-4 space-y-1">
          {title && <h3 className="text-base font-semibold">{title}</h3>}
          {description && (
            <p className="text-sm text-black/60">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};

export default FilterSectionShell;
