// components/ui/avatar.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

type AvatarProps = React.ComponentProps<"div"> & {
  src?: string;
  alt?: string;
};

export function Avatar({ src, alt, className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gray-200 text-sm font-medium overflow-hidden",
        className
      )}
      {...props}
    >
      {src ? (
        // byt till next/image om du vill
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        // fallback om ingen bild finns
        <span>👤</span>
      )}
    </div>
  );
}


