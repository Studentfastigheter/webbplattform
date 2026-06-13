/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, PlayCircle } from "@/components/icons";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

export type CompanyVideo = {
  originalUrl: string;
  embedUrl: string;
  thumbnailUrl?: string;
};

type CompanyVideoSectionProps = {
  videos: CompanyVideo[];
  companyName: string;
};

export default function CompanyVideoSection({
  videos,
  companyName,
}: CompanyVideoSectionProps) {
  const { locale } = useI18n();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(0);
  }, [videos]);

  if (videos.length === 0) return null;

  const currentIndex = Math.min(current, videos.length - 1);
  const currentVideo = videos[currentIndex];
  const hasMultipleVideos = videos.length > 1;

  const goToVideo = (index: number) => {
    setCurrent((index + videos.length) % videos.length);
  };

  return (
    <section
      className="w-full"
      aria-label={localizedText(locale, "Videor", "Videos")}
    >
      <div className="relative overflow-hidden rounded-3xl bg-gray-950 shadow-sm">
        <div className="aspect-video w-full">
          <iframe
            src={currentVideo.embedUrl}
            title={localizedText(
              locale,
              `${companyName} video ${currentIndex + 1}`,
              `${companyName} video ${currentIndex + 1}`,
            )}
            className="h-full w-full border-0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>

        {hasMultipleVideos && (
          <>
            <button
              type="button"
              onClick={() => goToVideo(currentIndex - 1)}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow transition hover:bg-white"
              aria-label={localizedText(
                locale,
                "F\u00f6reg\u00e5ende video",
                "Previous video",
              )}
            >
              <ChevronLeft className="h-5 w-5 text-gray-800" />
            </button>
            <button
              type="button"
              onClick={() => goToVideo(currentIndex + 1)}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow transition hover:bg-white"
              aria-label={localizedText(
                locale,
                "N\u00e4sta video",
                "Next video",
              )}
            >
              <ChevronRight className="h-5 w-5 text-gray-800" />
            </button>
          </>
        )}
      </div>

      {hasMultipleVideos && (
        <div
          className="mt-3 flex gap-2 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {videos.map((video, index) => (
            <button
              key={`${video.originalUrl}-${index}`}
              type="button"
              onClick={() => goToVideo(index)}
              className={`relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border-2 bg-gray-100 text-left transition ${
                index === currentIndex
                  ? "border-gray-900 opacity-100"
                  : "border-transparent opacity-70 hover:opacity-95"
              }`}
              aria-label={localizedText(
                locale,
                `Visa video ${index + 1}`,
                `Show video ${index + 1}`,
              )}
            >
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-900 text-white">
                  <PlayCircle className="h-7 w-7" />
                </div>
              )}
              <span className="absolute bottom-1 left-1 rounded-full bg-black/65 px-2 py-0.5 text-xs font-semibold text-white">
                {index + 1}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
