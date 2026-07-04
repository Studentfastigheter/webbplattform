"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { cn } from "@/lib/utils";

const GOOGLE_ADSENSE_CLIENT = "ca-pub-8695010385893430";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type GoogleAdSenseUnitProps = {
  slot: string;
  label: string;
  className?: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
};

export function GoogleAdSenseUnit({
  slot,
  label,
  className,
  format = "auto",
}: GoogleAdSenseUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    const element = adRef.current;
    if (!element || pushedRef.current) return;

    let observer: ResizeObserver | undefined;

    const requestAd = () => {
      if (pushedRef.current || !element.isConnected) return;

      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
        observer?.disconnect();
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Failed to request Google AdSense ad.", error);
        }
      }
    };

    const animationFrame = window.requestAnimationFrame(requestAd);

    if ("ResizeObserver" in window) {
      observer = new ResizeObserver(requestAd);
      observer.observe(element);
    }

    window.addEventListener("resize", requestAd);

    return () => {
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }
      observer?.disconnect();
      window.removeEventListener("resize", requestAd);
    };
  }, [slot]);

  return (
    <>
      <Script
        id="google-adsense"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_CLIENT}`}
        strategy="lazyOnload"
        crossOrigin="anonymous"
      />
      <ins
        ref={adRef}
        className={cn(
          "adsbygoogle !absolute !inset-0 !m-0 block !h-auto !max-h-full !w-full !max-w-full",
          className,
        )}
        style={{ display: "block" }}
        data-ad-client={GOOGLE_ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        aria-label={label}
      />
    </>
  );
}
