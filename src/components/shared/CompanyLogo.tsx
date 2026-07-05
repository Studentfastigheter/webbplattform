"use client";

import { useState } from "react";
import type { ComponentProps, ImgHTMLAttributes, ReactNode } from "react";
import { Building2 } from "@/components/icons";
import { cn } from "@/lib/utils";

type CompanyLogoProps = Omit<ComponentProps<"div">, "children"> & {
  src?: string | null;
  alt: string;
  name?: string | null;
  imageClassName?: string;
  fallbackClassName?: string;
  iconClassName?: string;
  fallback?: ReactNode;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  fetchPriority?: ImgHTMLAttributes<HTMLImageElement>["fetchPriority"];
  referrerPolicy?: ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
};

function getInitial(name?: string | null) {
  return name?.trim().charAt(0).toUpperCase() || "";
}

export default function CompanyLogo({
  src,
  alt,
  name,
  className,
  imageClassName,
  fallbackClassName,
  iconClassName,
  fallback,
  loading = "lazy",
  fetchPriority,
  referrerPolicy,
  ...props
}: CompanyLogoProps) {
  const initial = getInitial(name);
  // Trasiga logo-URL:er ska ge initial/ikon-fallbacken, inte trasig-bild-ikonen.
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  const resolvedSrc = src && src !== brokenSrc ? src : undefined;

  return (
    <div
      className={cn(
        "flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-black/5",
        className
      )}
      {...props}
    >
      {resolvedSrc ? (
        <img
          src={resolvedSrc}
          alt={alt}
          className={cn("block h-full w-full object-contain p-1.5", imageClassName)}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding="async"
          referrerPolicy={referrerPolicy}
          onError={() => setBrokenSrc(resolvedSrc)}
        />
      ) : fallback ? (
        fallback
      ) : initial ? (
        <span
          className={cn(
            "flex h-full w-full items-center justify-center bg-gray-50 text-xl font-semibold text-gray-500",
            fallbackClassName
          )}
        >
          {initial}
        </span>
      ) : (
        <Building2
          className={cn("h-1/2 w-1/2 text-gray-400", iconClassName)}
          strokeWidth={1.6}
        />
      )}
    </div>
  );
}
