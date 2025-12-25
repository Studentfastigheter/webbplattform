/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Pencil, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type Props = {
  title: string;
  images: string[];
  isEditable?: boolean;
};

export default function BostadGallery({ 
  title, 
  images, 
  isEditable=false 
}: Props) {
  const normalizedImages = useMemo(
    () => (images.length ? images : ["/appartment.jpg"]),
    [images],
  );

  const mainImage = normalizedImages[0];

  // === Thumbs (alltid 4 st) ===
  const thumbs = useMemo(() => {
    const base = normalizedImages.slice(1, 5); // max 4
    if (base.length === 0) {
      // Har bara 1 bild -> duplicera den 4 ggr
      return Array(4).fill(mainImage);
    }
    if (base.length < 4) {
      // Har 2–3 bilder -> fyll upp med sista bilden
      const last = base[base.length - 1];
      return [...base, ...Array(4 - base.length).fill(last)];
    }
    return base;
  }, [normalizedImages, mainImage]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (lightboxIndex !== null) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [lightboxIndex]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const showPrev = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return (prev - 1 + normalizedImages.length) % normalizedImages.length;
    });
  }, [normalizedImages.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return (prev + 1) % normalizedImages.length;
    });
  }, [normalizedImages.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeLightbox, lightboxIndex, showNext, showPrev]);

  const renderLightbox = () => {
    if (!mounted || lightboxIndex === null) return null;

    const src = normalizedImages[lightboxIndex] ?? normalizedImages[0];

    return createPortal(
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-sm"
        onClick={closeLightbox}
      >
        <button
          aria-label="Stäng"
          className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
          onClick={(e) => {
            e.stopPropagation();
            closeLightbox();
          }}
        >
          <X className="h-6 w-6" />
        </button>

        <button
          aria-label="Föregående bild"
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white transition hover:bg-black/80"
          onClick={(e) => {
            e.stopPropagation();
            showPrev();
          }}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div
          className="relative w-[90vw] max-w-5xl h-[70vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={src}
            alt={`${title} – bild ${lightboxIndex + 1}`}
            fill
            sizes="90vw"
            className="rounded-2xl object-contain"
          />
        </div>



        <button
          aria-label="Nästa bild"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white transition hover:bg-black/80"
          onClick={(e) => {
            e.stopPropagation();
            showNext();
          }}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>,
      document.body,
    );
  };

  return (
    <>
      <section className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div
          className="group relative h-[260px] cursor-pointer overflow-hidden rounded-3xl shadow-[0_15px_45px_rgba(0,0,0,0.08)] sm:h-[340px] lg:h-[420px]"
          onClick={() => !isEditable && setLightboxIndex(0)}
        >
          <Image
            src={mainImage}
            alt={title}
            fill
            priority
            sizes="(min-width: 1024px) 800px, 100vw"
            className="object-cover"
          />
          {isEditable && (
            <div className="invisible group-hover:visible absolute top-4 right-4 hover:bg-neutral-100/30 rounded-full p-2">
              <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                  <Pencil className="text-neutral-800 w-6 h-6" />
                </TooltipTrigger>
                <TooltipContent className="pointer-events-none">
                  <p>Redigera bild</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        <div className="grid h-[260px] grid-cols-2 grid-rows-2 gap-4 sm:h-[340px] lg:h-[420px]">
          {thumbs.map((src, idx) => {
            const imgIndex = idx + 1;
            return (
              <div
                key={`${src}-${idx}`}
                className="relative cursor-pointer overflow-hidden rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.05)] group"
                onClick={() => !isEditable && setLightboxIndex(imgIndex)}
              >
                <Image
                  src={src}
                  alt={`${title} - bild ${idx + 2}`}
                  fill
                  sizes="(min-width: 1024px) 400px, 50vw"
                  className="object-cover"
                />
                {isEditable && (
                  <div 
                    className="invisible group-hover:visible absolute top-4 right-4 hover:bg-neutral-100/30 rounded-full p-2"
                  >
                    <Tooltip disableHoverableContent>
                      <TooltipTrigger asChild>
                        <Pencil className="text-neutral-800 w-6 h-6" />
                      </TooltipTrigger>
                      <TooltipContent className="pointer-events-none">
                        <p>Redigera bild</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      {renderLightbox()}
    </>
  );
}
