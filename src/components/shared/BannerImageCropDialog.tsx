"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Move, RotateCcw } from "@/components/icons";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  COMPANY_BANNER_ASPECT_RATIO,
  COMPANY_BANNER_HEIGHT,
  COMPANY_BANNER_WIDTH,
} from "@/lib/banner-image";

type Size = {
  width: number;
  height: number;
};

type Point = {
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  startPointer: Point;
  startCrop: Point;
};

type BannerImageCropDialogProps = {
  file: File | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onCropComplete: (file: File) => void;
};

const outputType = "image/jpeg";
const outputQuality = 0.94;
const emptySize: Size = { width: 0, height: 0 };
const cropInset = 20;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getCropSize(image: Size): Size {
  if (!image.width || !image.height) return emptySize;

  const ratio = COMPANY_BANNER_WIDTH / COMPANY_BANNER_HEIGHT;
  const width = Math.min(COMPANY_BANNER_WIDTH, image.width, image.height * ratio);
  const height = width / ratio;

  return {
    width: Math.max(1, Math.floor(width)),
    height: Math.max(1, Math.floor(height)),
  };
}

function clampCropPosition(position: Point, image: Size, crop: Size): Point {
  return {
    x: clamp(position.x, 0, Math.max(0, image.width - crop.width)),
    y: clamp(position.y, 0, Math.max(0, image.height - crop.height)),
  };
}

function centeredCropPosition(image: Size, crop: Size): Point {
  return {
    x: Math.max(0, Math.round((image.width - crop.width) / 2)),
    y: Math.max(0, Math.round((image.height - crop.height) / 2)),
  };
}

function croppedFileName(file: File) {
  const base = file.name.replace(/\.[^.]+$/, "").trim() || "banner";
  return `${base}-banner.jpg`;
}

export default function BannerImageCropDialog({
  file,
  open,
  onOpenChange,
  onCancel,
  onCropComplete,
}: BannerImageCropDialogProps) {
  const { locale } = useI18n();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<Size>(emptySize);
  const [cropPosition, setCropPosition] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cropSize = useMemo(() => getCropSize(imageSize), [imageSize]);
  const canCrop = Boolean(objectUrl && imageSize.width && cropSize.width);
  const stageWidth = imageSize.width ? imageSize.width + cropInset * 2 : 640;
  const stageHeight = imageSize.height ? imageSize.height + cropInset * 2 : 260;
  const isUsingNativeOutputSize =
    cropSize.width === COMPANY_BANNER_WIDTH &&
    cropSize.height === COMPANY_BANNER_HEIGHT;

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      setImageSize(emptySize);
      setCropPosition({ x: 0, y: 0 });
      setError(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    setImageSize(emptySize);
    setCropPosition({ x: 0, y: 0 });
    setError(null);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!imageSize.width || !cropSize.width) return;
    setCropPosition((current) =>
      clampCropPosition(current, imageSize, cropSize)
    );
  }, [cropSize, imageSize]);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const nextImageSize = {
      width: event.currentTarget.naturalWidth,
      height: event.currentTarget.naturalHeight,
    };
    const nextCropSize = getCropSize(nextImageSize);

    setImageSize(nextImageSize);
    setCropPosition(centeredCropPosition(nextImageSize, nextCropSize));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!imageSize.width || isCropping) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startPointer: { x: event.clientX, y: event.clientY },
      startCrop: cropPosition,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    setCropPosition(
      clampCropPosition(
        {
          x: drag.startCrop.x + event.clientX - drag.startPointer.x,
          y: drag.startCrop.y + event.clientY - drag.startPointer.y,
        },
        imageSize,
        cropSize
      )
    );
  };

  const stopDragging = (event?: React.PointerEvent<HTMLDivElement>) => {
    if (event && dragRef.current?.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragRef.current = null;
    setIsDragging(false);
  };

  const resetCrop = () => {
    setCropPosition(centeredCropPosition(imageSize, cropSize));
    setError(null);
  };

  const handleCrop = async () => {
    if (!file || !imageRef.current || !cropSize.width || !cropSize.height) return;

    setIsCropping(true);
    setError(null);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = COMPANY_BANNER_WIDTH;
      canvas.height = COMPANY_BANNER_HEIGHT;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Canvas kunde inte startas.");
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.fillStyle = "#f3f4f6";
      context.fillRect(0, 0, COMPANY_BANNER_WIDTH, COMPANY_BANNER_HEIGHT);
      context.drawImage(
        imageRef.current,
        cropPosition.x,
        cropPosition.y,
        cropSize.width,
        cropSize.height,
        0,
        0,
        COMPANY_BANNER_WIDTH,
        COMPANY_BANNER_HEIGHT
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (nextBlob) => {
            if (nextBlob) resolve(nextBlob);
            else reject(new Error("Bilden kunde inte beskäras."));
          },
          outputType,
          outputQuality
        );
      });

      onCropComplete(
        new File([blob], croppedFileName(file), {
          type: outputType,
          lastModified: Date.now(),
        })
      );
    } catch (cropError) {
      setError(
        cropError instanceof Error
          ? cropError.message
          : localizedText(locale, "Bilden kunde inte beskäras.", "The image could not be cropped.")
      );
    } finally {
      setIsCropping(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100vh-2rem)] w-[min(calc(100vw-2rem),1280px)] max-w-none flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-200 px-5 py-4">
          <DialogTitle>{localizedText(locale, "Placera bannerutsnitt", "Position banner crop")}</DialogTitle>
          <DialogDescription className="text-sm">
            {localizedText(locale, "Bilden visas i originalstorlek. Dra ramen till det utsnitt som ska sparas.", "The image is shown at original size. Drag the frame to the crop that should be saved.")}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-3 grid gap-2 text-xs font-medium text-gray-600 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <span className="text-gray-400">{localizedText(locale, "Bild", "Image")}</span>{" "}
              {imageSize.width || "-"} x {imageSize.height || "-"} px
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <span className="text-gray-400">{localizedText(locale, "Ram", "Frame")}</span>{" "}
              {Math.round(cropSize.width || 0)} x {Math.round(cropSize.height || 0)} px
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <span className="text-gray-400">{localizedText(locale, "Sparas som", "Saved as")}</span>{" "}
              {COMPANY_BANNER_WIDTH} x {COMPANY_BANNER_HEIGHT} px
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {!isUsingNativeOutputSize && imageSize.width > 0 && (
              <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
                {localizedText(locale, "Bilden är mindre än standardbannern. Utsnittet skalas upp när du sparar.", "The image is smaller than the standard banner. The crop will be scaled up when you save.")}
              </div>
            )}

            <div className="max-h-[58vh] min-h-[220px] overflow-auto bg-[linear-gradient(45deg,#f4f6f8_25%,transparent_25%),linear-gradient(-45deg,#f4f6f8_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f4f6f8_75%),linear-gradient(-45deg,transparent_75%,#f4f6f8_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] p-4">
              <div
                className="relative mx-auto"
                style={{
                  width: stageWidth,
                  height: stageHeight,
                }}
              >
                {objectUrl ? (
                  <img
                    ref={imageRef}
                    src={objectUrl}
                    alt=""
                    draggable={false}
                    onLoad={handleImageLoad}
                    onError={() => setError(localizedText(locale, "Bilden kunde inte laddas.", "The image could not be loaded."))}
                    className="absolute select-none"
                    style={{
                      left: cropInset,
                      top: cropInset,
                      width: imageSize.width || "auto",
                      height: imageSize.height || "auto",
                      maxWidth: "none",
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500">
                    {localizedText(locale, "Ingen bild vald.", "No image selected.")}
                  </div>
                )}

                {canCrop && (
                  <div
                    className={`absolute touch-none rounded-lg border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.42),0_12px_34px_rgba(0,0,0,0.28),inset_0_0_0_1px_rgba(0,0,0,0.25)] ${
                      isDragging ? "cursor-grabbing" : "cursor-grab"
                    }`}
                    style={{
                      left: cropInset + cropPosition.x,
                      top: cropInset + cropPosition.y,
                      width: cropSize.width,
                      height: cropSize.height,
                      aspectRatio: COMPANY_BANNER_ASPECT_RATIO,
                    }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={stopDragging}
                    onPointerCancel={stopDragging}
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-md bg-[linear-gradient(to_right,rgba(255,255,255,0.42)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.42)_1px,transparent_1px)] bg-[length:33.333%_33.333%]" />
                    <div className="pointer-events-none absolute left-1/2 top-3 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm">
                      <Move className="h-3 w-3" />
                      {localizedText(locale, "Dra ramen", "Drag the frame")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-gray-200 bg-white px-5 py-4 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={resetCrop}
            isDisabled={!canCrop || isCropping}
          >
            <RotateCcw className="h-4 w-4" />
            {localizedText(locale, "Centrera ram", "Center frame")}
          </Button>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              isDisabled={isCropping}
            >
              {localizedText(locale, "Avbryt", "Cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleCrop}
              isLoading={isCropping}
              isDisabled={!canCrop || isCropping}
            >
              {localizedText(locale, "Spara beskärning", "Save crop")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
