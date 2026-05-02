import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const fieldInputClassName =
  "h-11 rounded-md border-gray-200 bg-white px-3 text-sm shadow-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus-visible:border-[#004225] focus-visible:ring-[#004225]/15";

export function FieldStack({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  );
}

export function FieldRow({
  children,
  description,
  label,
}: {
  apiName?: string;
  children: ReactNode;
  description?: string;
  label: string;
}) {
  return (
    <div className="grid gap-3 px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-xl">
          <p className="text-sm font-medium text-gray-950">{label}</p>
          {description && (
            <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export function FieldGrid({
  children,
  columns = 2,
}: {
  children: ReactNode;
  columns?: 2 | 3;
}) {
  return (
    <div
      className={cn(
        "grid gap-x-5",
        columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
      )}
    >
      {children}
    </div>
  );
}

export function StepFormLayout({ children }: { children: ReactNode }) {
  return <div className="w-full">{children}</div>;
}

export function StepFormShell({
  children,
  description,
  eyebrow = "Annonsdetaljer",
  heading,
  className,
}: {
  children: ReactNode;
  description?: ReactNode;
  eyebrow?: string;
  heading: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl", className)}>
      <div className="mb-4">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase text-gray-500">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-gray-950">
            {heading}
          </h2>
          {description && (
            <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
