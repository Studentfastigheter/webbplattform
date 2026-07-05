"use client";

import { Dispatch, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, ImagePlus, Trash2, Upload } from "@/components/icons";
import ListingImagePlaceholder from "@/features/listings/components/ListingImagePlaceholder";
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
  uploadSuccessMessage?: string;
  replaceSuccessMessage?: string;
  saveSuccessMessage?: string;
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

function triggerFileLabelOnKeyboard(
  event: React.KeyboardEvent<HTMLLabelElement>
) {
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  event.currentTarget.click();
}

export default function ImageUploadGallery({
  open,
  setOpen,
  imageUrls,
  onUploadImages,
  onSave,
  locale,
  uploadSuccessMessage,
  replaceSuccessMessage,
  saveSuccessMessage,
}: Props) {
  const initialImages = useMemo(
    () => imageUrls ?? FALLBACK_IMAGES,
    [imageUrls],
  );

  const [draftImages, setDraftImages] = useState<string[]>(initialImages);
  const draftImagesRef = useRef<string[]>(initialImages);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [brokenImages, setBrokenImages] = useState<ReadonlySet<string>>(new Set());

  const markImageBroken = (src: string) =>
    setBrokenImages((prev) => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });
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
        uploadSuccessMessage ??
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
        replaceSuccessMessage ??
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
        saveSuccessMessage ??
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
      <DialogContent className="max-h-[calc(100vh-2rem)] gap-0 overflow-hidden border-0 bg-white p-0 shadow-2xl sm:max-w-[1040px]">
        <DialogHeader className="border-b border-gray-200 px-5 py-4 pr-12 text-left sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold tracking-tight text-gray-950">
                {localizedText(locale, "Redigera bilder", "Edit images")}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-gray-500">
                {draftImages.length}{" "}
                {localizedText(
                  locale,
                  draftImages.length === 1 ? "bild i annonsen" : "bilder i annonsen",
                  draftImages.length === 1 ? "image in the listing" : "images in the listing"
                )}
              </DialogDescription>
            </div>

            <label
              role="button"
              tabIndex={pendingAction ? -1 : 0}
              onKeyDown={triggerFileLabelOnKeyboard}
              className={cn(
                "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(0,66,37,0.22)] transition hover:bg-[#00351e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                pendingAction && "pointer-events-none opacity-60"
              )}
            >
              <Upload className="h-4 w-4" />
              {localizedText(locale, "Ladda upp", "Upload")}
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
          </div>
        </DialogHeader>

        <div className="max-h-[calc(100vh-14rem)] overflow-y-auto bg-[#f8fafb] px-5 py-5 sm:px-6">
          {draftImages.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                <ImagePlus className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {localizedText(locale, "Inga bilder valda.", "No images selected.")}
              </p>
              <label
                role="button"
                tabIndex={pendingAction ? -1 : 0}
                onKeyDown={triggerFileLabelOnKeyboard}
                className={cn(
                  "mt-4 inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full border border-brand/20 bg-white px-4 text-sm font-semibold text-brand transition hover:bg-brand/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                  pendingAction && "pointer-events-none opacity-60"
                )}
              >
                <Upload className="h-4 w-4" />
                {localizedText(locale, "Ladda upp", "Upload")}
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
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    "group overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-150 ease-out",
                    "hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md",
                    draggedIndex === index
                      ? "scale-[0.98] border-brand opacity-60 shadow-lg"
                      : "border-gray-200",
                    dragOverIndex === index && draggedIndex !== index
                      ? "ring-2 ring-brand/40"
                      : "ring-0",
                  )}
                >
                  <div className="relative aspect-[4/3] bg-gray-100">
                    {brokenImages.has(image) ? (
                      <ListingImagePlaceholder className="absolute inset-0" />
                    ) : (
                      <img
                        src={image}
                        alt={localizedText(locale, `Bild ${index + 1}`, `Image ${index + 1}`)}
                        className="h-full w-full object-cover object-center"
                        onError={() => markImageBroken(image)}
                      />
                    )}
                    <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white/95 px-2 text-xs font-semibold text-gray-950 shadow-sm">
                        {index + 1}
                      </span>
                      {index === 0 && (
                        <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                          {localizedText(locale, "Huvudbild", "Main image")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-gray-500">
                      <GripVertical className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="truncate">
                        {localizedText(locale, `Bild ${index + 1}`, `Image ${index + 1}`)}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => moveImage(index, -1)}
                        isDisabled={index === 0}
                        aria-label={localizedText(locale, "Flytta upp", "Move up")}
                        title={localizedText(locale, "Flytta upp", "Move up")}
                        className="text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => moveImage(index, 1)}
                        isDisabled={index === draftImages.length - 1}
                        aria-label={localizedText(locale, "Flytta ner", "Move down")}
                        title={localizedText(locale, "Flytta ner", "Move down")}
                        className="text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <label
                        role="button"
                        tabIndex={pendingAction ? -1 : 0}
                        onKeyDown={triggerFileLabelOnKeyboard}
                        aria-label={localizedText(locale, "Byt bild", "Replace image")}
                        title={localizedText(locale, "Byt bild", "Replace image")}
                        className={cn(
                          "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-brand transition hover:bg-brand/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                          pendingAction && "pointer-events-none opacity-50"
                        )}
                      >
                        <ImagePlus className="h-4 w-4" />
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
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeImage(index)}
                        isDisabled={pendingAction}
                        aria-label={localizedText(locale, "Ta bort bild", "Remove image")}
                        title={localizedText(locale, "Ta bort bild", "Remove image")}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-gray-200 bg-white px-5 py-4 sm:px-6">
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
