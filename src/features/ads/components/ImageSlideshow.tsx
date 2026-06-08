/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

type ImageSlideshowProps = {
  images: string[];
  title: string;
};

export default function ImageSlideshow({ images, title }: ImageSlideshowProps) {
  const { locale } = useI18n();
  const [current, setCurrent] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrent(0);
  }, [images]);

  if (images.length === 0) return null;

  const currentIndex = Math.min(current, images.length - 1);

  const scrollTo = (index: number) => {
    setCurrent(index);
    const el = sliderRef.current;
    if (el) {
      const child = el.children[index] as HTMLElement | undefined;
      child?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  return (
    <section className="w-full">
      <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-3xl bg-gray-100">
        <img
          src={images[currentIndex]}
          alt={localizedText(locale, `${title} - bild ${currentIndex + 1}`, `${title} - image ${currentIndex + 1}`)}
          className="h-full w-full object-cover transition-all duration-300"
        />
        <span className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-sm font-medium text-white">
          {currentIndex + 1} / {images.length}
        </span>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                scrollTo((currentIndex - 1 + images.length) % images.length)
              }
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow transition hover:bg-white"
              aria-label={localizedText(locale, "Föregående", "Previous")}
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={() => scrollTo((currentIndex + 1) % images.length)}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow transition hover:bg-white"
              aria-label={localizedText(locale, "Nästa", "Next")}
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div
          ref={sliderRef}
          className="flex gap-2 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => scrollTo(i)}
              className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                i === currentIndex
                  ? "border-gray-900 opacity-100"
                  : "border-transparent opacity-60 hover:opacity-90"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
