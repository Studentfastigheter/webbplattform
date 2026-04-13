"use client";

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
      <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
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
  if (images.length === 0) return null;

  const shown = images.slice(0, 5);

  if (shown.length === 1) {
    return (
      <ImageTile
        src={shown[0]}
        alt="Bild 1"
        index={0}
        onImageClick={onImageClick}
        readOnly={readOnly}
        className="h-[420px] w-full rounded-2xl"
      />
    );
  }

  if (shown.length === 2) {
    return (
      <div className="grid h-[420px] grid-cols-2 gap-1.5">
        {shown.map((src, index) => (
          <ImageTile
            key={index}
            src={src}
            alt={`Bild ${index + 1}`}
            index={index}
            onImageClick={onImageClick}
            readOnly={readOnly}
            className={index === 0 ? "rounded-l-2xl" : "rounded-r-2xl"}
          />
        ))}
      </div>
    );
  }

  const side = shown.slice(1);

  return (
    <div className="grid h-[460px] grid-cols-[1fr_0.5fr] gap-1.5">
      <ImageTile
        src={shown[0]}
        alt="Bild 1"
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
          const isLast = index === side.length - 1 && images.length > 5;
          const isFirst = index === 0;
          const isEnd = index === side.length - 1;

          return (
            <ImageTile
              key={imageIndex}
              src={src}
              alt={`Bild ${imageIndex + 1}`}
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
                  +{images.length - 5} fler
                </span>
              )}
            </ImageTile>
          );
        })}
      </div>
    </div>
  );
}
