"use client";

import Image, { type ImageProps } from "next/image";
import { useState, type ReactNode } from "react";

type SafeImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string;
  /** Renderas istället för bilden när URL:en inte går att ladda. */
  fallback?: ReactNode;
};

/**
 * next/image som byter till `fallback` när bild-URL:en är trasig
 * (utgångna blob-länkar m.m.) istället för webbläsarens trasig-bild-ikon.
 */
export default function SafeImage({ src, alt, fallback = null, ...props }: SafeImageProps) {
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);

  if (!src || src === brokenSrc) {
    return <>{fallback}</>;
  }

  return <Image {...props} alt={alt} src={src} onError={() => setBrokenSrc(src)} />;
}
