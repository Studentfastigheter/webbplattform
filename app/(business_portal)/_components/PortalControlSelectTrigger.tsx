"use client";

import * as React from "react";

import { SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const portalControlSelectTriggerClassName =
  "h-8 w-full rounded-md border border-black/10 bg-white px-3 text-xs font-medium text-gray-700 shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition-colors hover:border-black/15 hover:bg-white focus:border-[#004225] focus:ring-0";

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
