"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, {
  type Area,
  type Point,
} from "react-easy-crop";
import { RotateCcw } from "@/components/icons";
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

type BannerImageCropDialogProps = {
  file: File | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onCropComplete: (file: File) => void;
};

const outputType = "image/jpeg";
const outputQuality = 0.94;
const minZoom = 1;
const maxZoom = 4;
const zoomStep = 0.05;
const bannerAspect = COMPANY_BANNER_WIDTH / COMPANY_BANNER_HEIGHT;

function croppedFileName(file: File) {
  const base = file.name.replace(/\.[^.]+$/, "").trim() || "banner";
  return `${base}-banner.jpg`;
}

function createImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

async function createCroppedBannerFile(
  imageSrc: string,
  cropPixels: Area,
  sourceFile: File
) {
  if (!cropPixels.width || !cropPixels.height) {
    throw new Error("Bilden kunde inte beskäras.");
  }

  const image = await createImage(imageSrc);
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
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    COMPANY_BANNER_WIDTH,
    COMPANY_BANNER_HEIGHT
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (nextBlob) => {
        if (nextBlob) {
          resolve(nextBlob);
        } else {
          reject(new Error("Bilden kunde inte beskäras."));
        }
      },
      outputType,
      outputQuality
    );
  });

  return new File([blob], croppedFileName(sourceFile), {
    type: outputType,
    lastModified: Date.now(),
  });
}

export default function BannerImageCropDialog({
  file,
  open,
  onOpenChange,
  onCancel,
  onCropComplete,
}: BannerImageCropDialogProps) {
  const { locale } = useI18n();
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const zoomLabel = `${Math.round(zoom * 100)}%`;
  const canCrop = Boolean(objectUrl && croppedAreaPixels);

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setIsCropping(false);
      setError(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setIsCropping(false);
    setError(null);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleCropAreaChange = useCallback(
    (_croppedArea: Area, nextCroppedAreaPixels: Area) => {
      setCroppedAreaPixels(nextCroppedAreaPixels);
    },
    []
  );

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setError(null);
  };

  const handleCrop = async () => {
    if (!file || !objectUrl || !croppedAreaPixels) return;

    setIsCropping(true);
    setError(null);

    try {
      onCropComplete(
        await createCroppedBannerFile(objectUrl, croppedAreaPixels, file)
      );
    } catch (cropError) {
      setError(
        cropError instanceof Error
          ? cropError.message
          : localizedText(
              locale,
              "Bilden kunde inte beskäras.",
              "The image could not be cropped."
            )
      );
    } finally {
      setIsCropping(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100vh-2rem)] w-[min(calc(100vw-2rem),980px)] !max-w-[min(calc(100vw-2rem),980px)] flex-col gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-xl">
        <DialogHeader className="px-6 pb-4 pt-6 pr-12">
          <DialogTitle>
            {localizedText(locale, "Placera bannerutsnitt", "Position banner crop")}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {localizedText(
              locale,
              "Dra bilden i ramen och justera zoom.",
              "Drag the image inside the frame and adjust zoom."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5">
          <div className="overflow-hidden">
              <div
                className="relative mx-auto w-full overflow-hidden rounded-lg border border-gray-300 bg-gray-100"
                style={{
                  aspectRatio: COMPANY_BANNER_ASPECT_RATIO,
                }}
              >
                {objectUrl ? (
                  <Cropper
                    image={objectUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={bannerAspect}
                    minZoom={minZoom}
                    maxZoom={maxZoom}
                    zoomSpeed={0.8}
                    objectFit="cover"
                    restrictPosition
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropAreaChange={handleCropAreaChange}
                    onCropComplete={handleCropAreaChange}
                    mediaProps={{
                      alt: localizedText(
                        locale,
                        "Vald bannerbild",
                        "Selected banner image"
                      ),
                    }}
                    classes={{
                      cropAreaClassName:
                        "!border !border-white/95 !shadow-none",
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500">
                    {localizedText(locale, "Ingen bild vald.", "No image selected.")}
                  </div>
                )}
              </div>

            <div className="mt-4">
              <div className="grid gap-2 sm:grid-cols-[3.5rem_minmax(0,1fr)_3rem] sm:items-center">
                <label
                  htmlFor="banner-crop-zoom"
                  className="text-sm text-gray-600"
                >
                  {localizedText(locale, "Zoom", "Zoom")}
                </label>
                <input
                  id="banner-crop-zoom"
                  type="range"
                  min={minZoom}
                  max={maxZoom}
                  step={zoomStep}
                  value={zoom}
                  disabled={!objectUrl || isCropping}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="h-1.5 w-full cursor-pointer accent-[#004225] disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span className="text-right text-sm tabular-nums text-gray-600">
                  {zoomLabel}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 pb-6 pt-0 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={resetCrop}
            isDisabled={!canCrop || isCropping}
          >
            <RotateCcw className="h-4 w-4" />
            {localizedText(locale, "Återställ bild", "Reset image")}
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
