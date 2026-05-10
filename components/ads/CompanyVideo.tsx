"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

type CompanyVideoProps = {
  videoUrl: string | null | undefined;
  companyName?: string;
};

/**
 * Extracts the YouTube video ID from a typical embed URL.
 * Why: we use it to grab a high-quality poster from i.ytimg.com so the
 * iframe only loads when the user actually wants to watch — keeps the
 * page light, the section visually rich, and the "click to play" feels
 * intentional rather than passive.
 */
function getYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const embedMatch = parsed.pathname.match(/\/embed\/([^/?#]+)/);
    if (embedMatch?.[1]) return embedMatch[1];
    const v = parsed.searchParams.get("v");
    if (v) return v;
    const short = parsed.pathname.match(/\/([^/?#]+)$/);
    return short?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * Renders a YouTube embed in a responsive 16:9 container.
 * Click-to-load thumbnail keeps the initial render snappy.
 * Returns null gracefully when videoUrl is falsy.
 */
export default function CompanyVideo({ videoUrl, companyName }: CompanyVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videoUrl) return null;

  const videoId = getYoutubeId(videoUrl);
  const poster = videoId
    ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
    : null;
  const title = companyName ? `${companyName} – presentationsvideo` : "Presentationsvideo";

  return (
    <section className="w-full">
      {/* Player frame — soft brand-tinted shell with a subtle glow */}
      <div className="relative">
        {/* Decorative ambient glow behind the frame */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-6 -top-4 -bottom-4 -z-10 rounded-[36px] bg-gradient-to-br from-[#004225]/5 via-transparent to-[#0a7a4a]/5 blur-2xl"
        />

        <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-black/5 bg-gray-900 shadow-[0_18px_45px_rgba(0,0,0,0.10)]">
          {isPlaying ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`${videoUrl}?rel=0&modestbranding=1&autoplay=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              className="group absolute inset-0 h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004225] focus-visible:ring-offset-2"
              aria-label={`Spela upp ${title}`}
            >
              {poster ? (
                <Image
                  src={poster}
                  alt={title}
                  fill
                  sizes="(min-width: 1024px) 1000px, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  /* maxresdefault sometimes 404s; fallback to hqdefault */
                  onError={(event) => {
                    const target = event.currentTarget;
                    if (videoId && !target.dataset.fallback) {
                      target.dataset.fallback = "true";
                      target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                    }
                  }}
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#004225] via-[#0a5e36] to-[#0a7a4a]" />
              )}

              {/* Gradient veil that intensifies on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent transition-opacity duration-300 group-hover:from-black/70" />

              {/* Play button — circular, brand-tinted, scales softly on hover */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-[#004225] shadow-[0_18px_45px_rgba(0,0,0,0.30)] transition-transform duration-300 group-hover:scale-110">
                  {/* Subtle pulsing ring — pure CSS, no JS overhead */}
                  <span
                    aria-hidden
                    className="absolute inset-0 animate-ping rounded-full bg-white/60 opacity-60"
                  />
                  <Play className="relative ml-1 h-9 w-9 fill-current" />
                </span>
              </div>

              {/* Bottom caption */}
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
                <div className="text-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/80">
                    Spela upp video
                  </p>
                  <p className="mt-1 text-base font-semibold sm:text-lg">
                    {companyName ? `Möt ${companyName}` : "Företagspresentation"}
                  </p>
                </div>
                <span className="hidden rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm sm:inline-flex">
                  YouTube
                </span>
              </div>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
