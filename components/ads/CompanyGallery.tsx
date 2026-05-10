"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ImageIcon, Maximize2 } from "lucide-react";

type CompanyGalleryProps = {
  images: string[] | null | undefined;
  companyName?: string;
};

/**
 * Compact image gallery for the company page.
 * Shows up to 5 images in a masonry-style grid with a lightbox.
 * Returns null gracefully when images is empty/null.
 */
export default function CompanyGallery({ images, companyName }: CompanyGalleryProps) {
  const safeImages = images && images.length > 0 ? images : null;
  if (!safeImages) return null;

  return <GalleryInner images={safeImages} companyName={companyName} />;
}

// ─── Inner component (avoids rules-of-hooks on early return) ─────────────────

function GalleryInner({
  images,
  companyName,
}: {
  images: string[];
  companyName?: string;
}) {
  const visible = images.slice(0, 5);
  const remaining = Math.max(images.length - 5, 0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Lock body scroll while the lightbox is open
  useEffect(() => {
    if (lightboxIndex === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightboxIndex]);

  const close = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null ? null : (i - 1 + images.length) % images.length,
      ),
    [images.length],
  );
  const next = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null ? null : (i + 1) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, close, prev, next]);

  const title = companyName ?? "Företaget";

  return (
    <section className="w-full">
      {/* Section header — same rhythm as the video section */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#004225]/10 text-[#004225]">
            <ImageIcon className="h-[18px] w-[18px]" />
          </span>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900">Bildgalleri</h2>
            <p className="text-xs text-gray-500">
              {images.length}{" "}
              {images.length === 1 ? "bild" : "bilder"} från {title}
            </p>
          </div>
        </div>

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="hidden items-center gap-2 rounded-full border border-[#004225]/15 bg-white px-4 py-2 text-sm font-semibold text-[#004225] transition hover:bg-[#004225]/5 sm:inline-flex"
          >
            <Maximize2 className="h-4 w-4" />
            Visa alla bilder
          </button>
        )}
      </div>

      {/* Grid: 1 tall image left + 4-cell grid right */}
      <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
        {/* Main image */}
        <button
          onClick={() => setLightboxIndex(0)}
          className="group relative h-64 w-full overflow-hidden rounded-3xl border border-black/5 shadow-[0_12px_30px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004225] sm:h-80 lg:h-96"
          aria-label={`Öppna bild 1 av ${title}`}
        >
          <Image
            src={visible[0]}
            alt={`${title} – bild 1`}
            fill
            sizes="(min-width: 640px) 600px, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Soft caption gradient that brightens on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="absolute bottom-4 left-4 hidden rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#004225] shadow-sm backdrop-blur-sm transition-opacity duration-300 group-hover:inline-flex">
            Klicka för att förstora
          </span>
        </button>

        {/* 4-cell sub-grid */}
        <div className="grid grid-cols-2 grid-rows-2 gap-3">
          {visible.slice(1, 5).map((src, idx) => {
            const isLast = idx === 3 && remaining > 0;
            return (
              <button
                key={src}
                onClick={() => setLightboxIndex(idx + 1)}
                className="group relative overflow-hidden rounded-2xl border border-black/5 shadow-[0_8px_20px_rgba(0,0,0,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004225]"
                aria-label={`Öppna bild ${idx + 2} av ${title}`}
              >
                <Image
                  src={src}
                  alt={`${title} – bild ${idx + 2}`}
                  fill
                  sizes="(min-width: 640px) 300px, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {isLast && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 text-white backdrop-blur-[2px]">
                    <span className="text-2xl font-bold leading-none">
                      +{remaining}
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wider">
                      fler bilder
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* "Visa alla" CTA on small screens — keeps the desktop button hidden */}
      {images.length > 1 && (
        <div className="mt-4 flex sm:hidden">
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#004225]/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#004225] transition hover:bg-[#004225]/5"
          >
            <Maximize2 className="h-4 w-4" />
            Visa alla {images.length} bilder
          </button>
        </div>
      )}

      {/* Lightbox */}
      {mounted && lightboxIndex !== null &&
        createPortal(
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 backdrop-blur-sm"
            onClick={close}
          >
            {/* Close */}
            <button
              aria-label="Stäng"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/25"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Prev */}
            <button
              aria-label="Föregående"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Image */}
            <div
              className="relative h-[80vh] w-[90vw] max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[lightboxIndex]}
                alt={`${title} – bild ${lightboxIndex + 1}`}
                fill
                sizes="90vw"
                className="rounded-2xl object-contain"
              />
              <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
                {lightboxIndex + 1} / {images.length}
              </p>
            </div>

            {/* Next */}
            <button
              aria-label="Nästa"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>,
          document.body,
        )}
    </section>
  );
}
