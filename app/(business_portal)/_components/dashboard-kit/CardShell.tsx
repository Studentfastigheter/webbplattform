"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function CardShell({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-gray-200 bg-white p-5 sm:p-6", className)}>
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {description ? <p className="mt-1 text-theme-sm text-gray-500">{description}</p> : null}
        </div>
        {action ?? null}
      </header>
      {children}
    </section>
  );
}

