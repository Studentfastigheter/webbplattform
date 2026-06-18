"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  onImageClick?: (index: number) => void;
  readOnly?: boolean;
};

type TileProps = {
  src: string;
  alt: string;
  className?: string;
  children?: React.ReactNode;
  index: number;
  onImageClick?: (index: number) => void;
  readOnly: boolean;
};

const MAX_PREVIEW_IMAGES = 3;

function ImageTile({
  src,
  alt,
  className,
  children,
  index,
  onImageClick,
  readOnly,
}: TileProps) {
  const content = (
    <>
      <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover object-center" />
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-black/0",
          !readOnly && "transition hover:bg-black/10",
        )}
      >
        {children}
      </div>
    </>
  );

  if (readOnly) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn("relative cursor-pointer overflow-hidden", className)}
      onClick={() => onImageClick?.(index)}
    >
      {content}
    </button>
  );
}

export default function BostadImagePreviewGrid({
  images,
  onImageClick,
  readOnly = false,
}: Props) {
  const { locale } = useI18n();
  if (images.length === 0) return null;

  const shown = images.slice(0, MAX_PREVIEW_IMAGES);

  if (shown.length === 1) {
    return (
      <ImageTile
        src={shown[0]}
        alt={localizedText(locale, "Bild 1", "Image 1")}
        index={0}
        onImageClick={onImageClick}
        readOnly={readOnly}
        className="h-[420px] w-full rounded-2xl"
      />
    );
  }

  const side = shown.slice(1);

  return (
    <div className="grid h-[460px] grid-cols-[1fr_0.5fr] gap-1.5">
      <ImageTile
        src={shown[0]}
        alt={localizedText(locale, "Bild 1", "Image 1")}
        index={0}
        onImageClick={onImageClick}
        readOnly={readOnly}
        className="h-full rounded-l-2xl"
      />

      <div
        className="grid h-full gap-1.5"
        style={{ gridTemplateRows: `repeat(${side.length}, minmax(0, 1fr))` }}
      >
        {side.map((src, index) => {
          const imageIndex = index + 1;
          const isLast = index === side.length - 1 && images.length > MAX_PREVIEW_IMAGES;
          const isFirst = index === 0;
          const isEnd = index === side.length - 1;

          return (
            <ImageTile
              key={imageIndex}
              src={src}
              alt={localizedText(locale, `Bild ${imageIndex + 1}`, `Image ${imageIndex + 1}`)}
              index={imageIndex}
              onImageClick={onImageClick}
              readOnly={readOnly}
              className={cn(
                isFirst && "rounded-tr-2xl",
                isEnd && "rounded-br-2xl",
              )}
            >
              {isLast && (
                <span className="rounded-lg bg-black/40 px-3 py-1 text-lg font-semibold text-white drop-shadow-lg">
                  +{images.length - MAX_PREVIEW_IMAGES} {localizedText(locale, "fler", "more")}
                </span>
              )}
            </ImageTile>
          );
        })}
      </div>
    </div>
  );
}
