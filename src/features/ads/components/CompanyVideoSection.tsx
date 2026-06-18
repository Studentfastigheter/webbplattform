"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";
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
  const visibleVideos = useMemo(
    () => videos.filter((video) => video.embedUrl),
    [videos]
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex((current) =>
      Math.min(current, Math.max(visibleVideos.length - 1, 0))
    );
  }, [visibleVideos.length]);

  if (visibleVideos.length === 0) return null;

  const currentVideo = visibleVideos[currentIndex] ?? visibleVideos[0];
  const hasMultipleVideos = visibleVideos.length > 1;
  const goToVideo = (index: number) => {
    setCurrentIndex((index + visibleVideos.length) % visibleVideos.length);
  };

  return (
    <section
      className="w-full"
      aria-label={localizedText(
        locale,
        visibleVideos.length === 1 ? "Video" : "Videor",
        visibleVideos.length === 1 ? "Video" : "Videos",
      )}
    >
      <div className="overflow-hidden rounded-xl bg-black shadow-[0_18px_45px_rgba(15,23,42,0.14)] ring-1 ring-black/5">
        <div className="relative aspect-video w-full">
          <iframe
            key={currentVideo.originalUrl}
            src={currentVideo.embedUrl}
            title={localizedText(
              locale,
              hasMultipleVideos
                ? `${companyName} video ${currentIndex + 1}`
                : `${companyName} video`,
              hasMultipleVideos
                ? `${companyName} video ${currentIndex + 1}`
                : `${companyName} video`,
            )}
            className="h-full w-full border-0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />

          {hasMultipleVideos ? (
            <>
              <button
                type="button"
                onClick={() => goToVideo(currentIndex - 1)}
                className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-sm ring-1 ring-black/10 transition hover:bg-white"
                aria-label={localizedText(
                  locale,
                  "Föregående video",
                  "Previous video",
                )}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => goToVideo(currentIndex + 1)}
                className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-sm ring-1 ring-black/10 transition hover:bg-white"
                aria-label={localizedText(
                  locale,
                  "Nästa video",
                  "Next video",
                )}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white">
                {currentIndex + 1} / {visibleVideos.length}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {hasMultipleVideos ? (
        <div className="mt-3 flex items-center justify-center gap-2">
          {visibleVideos.map((video, index) => (
            <button
              key={`${video.originalUrl}-indicator-${index}`}
              type="button"
              onClick={() => goToVideo(index)}
              className={`h-2.5 rounded-full transition ${
                index === currentIndex
                  ? "w-7 bg-[#004225]"
                  : "w-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={localizedText(
                locale,
                `Visa video ${index + 1}`,
                `Show video ${index + 1}`,
              )}
              aria-current={index === currentIndex ? "true" : undefined}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
