"use client";

import { Dispatch, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, ImagePlus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Locale } from "@/i18n/config";
import { localizedText } from "@/i18n/text";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  setOpen: Dispatch<React.SetStateAction<boolean>>;
  imageUrls?: string[];
  onUploadImages?: (files: File[]) => Promise<string[]>;
  onSave?: (imageUrls: string[]) => void | Promise<void>;
  locale: Locale;
};

const FALLBACK_IMAGES = [
  "/appartment.jpg",
  "/appartment.jpg",
  "/appartment.jpg",
  "/appartment.jpg",
  "/appartment.jpg",
];

function filesToArray(files: FileList | null): File[] {
  if (!files) return [];
  return Array.from(files);
}

export default function ImageUploadGallery({
  open,
  setOpen,
  imageUrls,
  onUploadImages,
  onSave,
  locale,
}: Props) {
  const initialImages = useMemo(
    () => imageUrls ?? FALLBACK_IMAGES,
    [imageUrls],
  );

  const [draftImages, setDraftImages] = useState<string[]>(initialImages);
  const draftImagesRef = useRef<string[]>(initialImages);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState(false);

  useEffect(() => {
    if (!open) return;

    draftImagesRef.current = initialImages;
    setDraftImages(initialImages);
  }, [initialImages, open]);

  const persistImages = async (nextImages: string[]) => {
    const previousImages = draftImagesRef.current;
    draftImagesRef.current = nextImages;
    setDraftImages(nextImages);

    try {
      await onSave?.(nextImages);
    } catch (error) {
      draftImagesRef.current = previousImages;
      setDraftImages(previousImages);
      throw error;
    }
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return [];

    if (onUploadImages) {
      return onUploadImages(files);
    }

    return files.map((file) => URL.createObjectURL(file));
  };

  const addImages = async (files: FileList | null) => {
    const selectedFiles = filesToArray(files);
    if (selectedFiles.length === 0) return;

    setPendingAction(true);
    try {
      const uploadedUrls = await uploadFiles(selectedFiles);
      if (uploadedUrls.length === 0) return;

      await persistImages([...draftImagesRef.current, ...uploadedUrls]);
      toast.success(
        localizedText(
          locale,
          "Bilden har laddats upp och sparats pa annonsen.",
          "The image has been uploaded and saved to the listing."
        )
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : localizedText(locale, "Kunde inte ladda upp bilden.", "Could not upload the image.")
      );
    } finally {
      setPendingAction(false);
    }
  };

  const replaceImage = async (index: number, files: FileList | null) => {
    const [selectedFile] = filesToArray(files);
    if (!selectedFile) return;

    setPendingAction(true);
    try {
      const [uploadedUrl] = await uploadFiles([selectedFile]);
      if (!uploadedUrl) return;

      await persistImages(
        draftImagesRef.current.map((image, imageIndex) =>
          imageIndex === index ? uploadedUrl : image
        )
      );
      toast.success(
        localizedText(
          locale,
          "Bilden har bytts och sparats pa annonsen.",
          "The image has been replaced and saved to the listing."
        )
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : localizedText(locale, "Kunde inte byta bilden.", "Could not replace the image.")
      );
    } finally {
      setPendingAction(false);
    }
  };

  const removeImage = (index: number) => {
    setDraftImages((current) => {
      const nextImages = current.filter((_, imageIndex) => imageIndex !== index);
      draftImagesRef.current = nextImages;
      return nextImages;
    });
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setDraftImages((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) return current;

      const next = [...current];
      const currentImage = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = currentImage;
      draftImagesRef.current = next;
      return next;
    });
  };

  const moveImageToIndex = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    setDraftImages((current) => {
      if (
        fromIndex < 0 ||
        fromIndex >= current.length ||
        toIndex < 0 ||
        toIndex >= current.length
      ) {
        return current;
      }

      const next = [...current];
      const [movedImage] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, movedImage);
      draftImagesRef.current = next;
      return next;
    });
  };

  const clearDragState = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    setPendingAction(true);
    try {
      await persistImages(draftImagesRef.current);
      toast.success(
      localizedText(
        locale,
        "Dina bildändringar har sparats.",
        "Your image changes have been saved."
      )
    );
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : localizedText(locale, "Kunde inte spara bilderna.", "Could not save the images.")
      );
    } finally {
      setPendingAction(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[1025px] max-h-11/12 overflow-auto">
        <DialogHeader>
          <DialogTitle>{localizedText(locale, "Redigera bilder", "Edit images")}</DialogTitle>
          <DialogDescription>
            {localizedText(
              locale,
              "Granska alla bilder, ändra ordning, byt ut, ta bort eller ladda upp nya.",
              "Review all images, reorder, replace, remove, or upload new ones."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid gap-6">
          <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center transition hover:border-gray-400 hover:bg-gray-100">
            <Upload className="h-6 w-6 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {localizedText(locale, "Ladda upp bilder", "Upload images")}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {localizedText(
                  locale,
                  "Välj en eller flera bilder från datorn.",
                  "Choose one or more images from your computer."
                )}
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={pendingAction}
              className="sr-only"
              onChange={(event) => {
                addImages(event.target.files);
                event.target.value = "";
              }}
            />
          </label>

          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {localizedText(locale, "Alla bilder", "All images")}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  {localizedText(
                    locale,
                    "Den första bilden används som huvudbild i previewn.",
                    "The first image is used as the main image in the preview."
                  )}
                </p>
              </div>
              <span className="text-sm text-gray-500">
                {draftImages.length}{" "}
                {localizedText(locale, "bilder", draftImages.length === 1 ? "image" : "images")}
              </span>
            </div>

            {draftImages.length === 0 ? (
              <div className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
                {localizedText(locale, "Inga bilder valda.", "No images selected.")}
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {draftImages.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    draggable
                    onDragStart={(event) => {
                      setDraggedIndex(index);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", String(index));
                    }}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      setDragOverIndex(index);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setDragOverIndex(index);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const fromIndex = draggedIndex ?? Number(event.dataTransfer.getData("text/plain"));
                      if (Number.isInteger(fromIndex)) {
                        moveImageToIndex(fromIndex, index);
                      }
                      clearDragState();
                    }}
                    onDragEnd={clearDragState}
                    className={cn(
                      "group overflow-hidden rounded-lg border bg-white transition-all duration-150 ease-out",
                      "hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md",
                      draggedIndex === index
                        ? "scale-[0.98] border-[#004225] opacity-60 shadow-lg"
                        : "border-gray-200",
                      dragOverIndex === index && draggedIndex !== index
                        ? "ring-2 ring-[#004225]/40"
                        : "ring-0",
                    )}
                  >
                    <div className="relative aspect-[4/3] bg-gray-100">
                      <img
                        src={image}
                        alt={localizedText(locale, `Bild ${index + 1}`, `Image ${index + 1}`)}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm">
                        <GripVertical className="h-3.5 w-3.5 text-gray-500" />
                        <span>{index + 1}</span>
                      </div>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 rounded-full bg-[#004225] px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                          {localizedText(locale, "Huvudbild", "Main image")}
                        </span>
                      )}
                    </div>

                    <div className="grid gap-2 p-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => moveImage(index, -1)}
                          isDisabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                          {localizedText(locale, "Upp", "Up")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => moveImage(index, 1)}
                          isDisabled={index === draftImages.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                          {localizedText(locale, "Ner", "Down")}
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <label className="inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#004225] px-3 text-sm font-semibold text-[#004225] transition-colors hover:bg-[#004225]/5">
                          <ImagePlus className="h-4 w-4" />
                          {localizedText(locale, "Byt", "Replace")}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={pendingAction}
                            className="sr-only"
                            onChange={(event) => {
                              replaceImage(index, event.target.files);
                              event.target.value = "";
                            }}
                          />
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeImage(index)}
                          isDisabled={pendingAction}
                        >
                          <Trash2 className="h-4 w-4" />
                          {localizedText(locale, "Ta bort", "Remove")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="outline">{localizedText(locale, "Avbryt", "Cancel")}</Button>
          </DialogClose>
          <Button onClick={handleSave} isLoading={pendingAction} isDisabled={pendingAction}>
            {localizedText(locale, "Spara ändringar", "Save changes")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
