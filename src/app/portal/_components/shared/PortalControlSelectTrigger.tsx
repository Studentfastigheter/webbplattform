"use client";

import * as React from "react";

import { SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const portalControlSelectTriggerClassName =
  "h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 shadow-theme-xs transition-colors hover:border-gray-300 hover:bg-gray-50 focus:border-[#004225] focus:ring-4 focus:ring-[#004225]/10";

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
