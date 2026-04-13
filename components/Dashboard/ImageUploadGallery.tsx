"use client";

import { Dispatch, useEffect, useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  setOpen: Dispatch<React.SetStateAction<boolean>>;
  imageUrls?: string[];
  onSave?: (imageUrls: string[]) => void;
};

const FALLBACK_IMAGES = [
  "/appartment.jpg",
  "/appartment.jpg",
  "/appartment.jpg",
  "/appartment.jpg",
  "/appartment.jpg",
];

function filesToUrls(files: FileList | null) {
  if (!files) return [];
  return Array.from(files).map((file) => URL.createObjectURL(file));
}

export default function ImageUploadGallery({
  open,
  setOpen,
  imageUrls,
  onSave,
}: Props) {
  const initialImages = useMemo(
    () => imageUrls ?? FALLBACK_IMAGES,
    [imageUrls],
  );

  const [draftImages, setDraftImages] = useState<string[]>(initialImages);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (open) setDraftImages(initialImages);
  }, [initialImages, open]);

  const addImages = (files: FileList | null) => {
    const nextImages = filesToUrls(files);
    if (nextImages.length === 0) return;
    setDraftImages((current) => [...current, ...nextImages]);
  };

  const replaceImage = (index: number, files: FileList | null) => {
    const [nextImage] = filesToUrls(files);
    if (!nextImage) return;

    setDraftImages((current) =>
      current.map((image, imageIndex) => imageIndex === index ? nextImage : image),
    );
  };

  const removeImage = (index: number) => {
    setDraftImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setDraftImages((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) return current;

      const next = [...current];
      const currentImage = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = currentImage;
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
      return next;
    });
  };

  const clearDragState = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = () => {
    onSave?.(draftImages);
    toast.success("Dina bildändringar har sparats.");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[1025px] max-h-11/12 overflow-auto">
        <DialogHeader>
          <DialogTitle>Redigera bilder</DialogTitle>
          <DialogDescription>
            Granska alla bilder, ändra ordning, byt ut, ta bort eller ladda upp nya.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid gap-6">
          <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center transition hover:border-gray-400 hover:bg-gray-100">
            <Upload className="h-6 w-6 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Ladda upp bilder</p>
              <p className="mt-1 text-xs text-gray-500">
                Välj en eller flera bilder från datorn.
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
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
                <h3 className="text-sm font-semibold text-gray-900">Alla bilder</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Den första bilden används som huvudbild i previewn.
                </p>
              </div>
              <span className="text-sm text-gray-500">
                {draftImages.length} bilder
              </span>
            </div>

            {draftImages.length === 0 ? (
              <div className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
                Inga bilder valda.
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {draftImages.map((src, index) => (
                  <div
                    key={`${src}-${index}`}
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
                        src={src}
                        alt={`Bild ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm">
                        <GripVertical className="h-3.5 w-3.5 text-gray-500" />
                        <span>{index + 1}</span>
                      </div>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 rounded-full bg-[#004225] px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                          Huvudbild
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
                          Upp
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => moveImage(index, 1)}
                          isDisabled={index === draftImages.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                          Ner
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <label className="inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#004225] px-3 text-sm font-semibold text-[#004225] transition-colors hover:bg-[#004225]/5">
                          <ImagePlus className="h-4 w-4" />
                          Byt
                          <input
                            type="file"
                            accept="image/*"
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
                        >
                          <Trash2 className="h-4 w-4" />
                          Ta bort
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
            <Button variant="outline">Avbryt</Button>
          </DialogClose>
          <Button onClick={handleSave}>Spara ändringar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
