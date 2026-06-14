"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PortalPageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export default function PortalPageHeader({
  title,
  action,
  className,
}: PortalPageHeaderProps) {
  return (
    <header
      className={cn(
        "flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="break-words text-2xl font-semibold leading-8 text-gray-950">
          {title}
        </h1>
      </div>
      {action ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {action}
        </div>
      ) : null}
    </header>
  );
}
