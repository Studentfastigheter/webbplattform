"use client";

import * as React from "react";

import { SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const portalControlSelectTriggerClassName =
  "h-9 w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 shadow-theme-xs transition-colors hover:border-gray-300 hover:bg-gray-50 focus:border-brand focus:ring-4 focus:ring-brand/10 *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:max-w-full *:data-[slot=select-value]:truncate";

export const portalControlSelectContentClassName =
  "z-[70] max-w-[calc(100vw-2rem)] border-gray-200 bg-white";

export function PortalControlSelectTrigger({
  className,
  size = "sm",
  ...props
}: React.ComponentProps<typeof SelectTrigger>) {
  return (
    <SelectTrigger
      size={size}
      className={cn(portalControlSelectTriggerClassName, className)}
      {...props}
    />
  );
}
