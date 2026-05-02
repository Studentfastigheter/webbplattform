"use client";

import { Plus, Trash2 } from "lucide-react";

import { FormGroup, FormShell } from "@/components/Dashboard/Form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useListingDraft } from "../listingDraftContext";
import {
  FieldRow,
  FieldStack,
  StepFormLayout,
  fieldInputClassName,
} from "./listingFormUi";

const MIN_IMAGE_FIELDS = 3;

function normalizeImages(images: string[]) {
  const next = [...images];
  while (next.length < MIN_IMAGE_FIELDS) next.push("");
  return next;
}

export default function ImagePublishPage() {
  const { draft, updateDraft } = useListingDraft();
  const imageFields = normalizeImages(draft.images);
  const previewImages = imageFields.filter(Boolean).slice(0, 5);

  const updateImage = (index: number, value: string) => {
    const next = normalizeImages(draft.images);
    next[index] = value;
    updateDraft({ images: next });
  };

  const removeImage = (index: number) => {
    updateDraft({
      images: normalizeImages(draft.images).filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    });
  };

  return (
    <StepFormLayout>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)] xl:items-start">
        <FormShell
          className="m-0 max-w-none"
          heading="Bilder"
          description="Lägg till publika bildlänkar. Första länken används som huvudbild."
        >
          <FieldStack>
            <FieldRow
              apiName="images"
              label="Bildlänkar"
              description="Klistra in en URL per rad."
            >
              <FormGroup gap="md" className="mb-0">
                {imageFields.map((imageUrl, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      className={fieldInputClassName}
                      value={imageUrl}
                      placeholder={
                        index === 0
                          ? "https://exempel.se/huvudbild.jpg"
                          : "https://exempel.se/bild.jpg"
                      }
                      onChange={(event) => updateImage(index, event.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      isDisabled={imageFields.length <= MIN_IMAGE_FIELDS}
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => updateDraft({ images: [...imageFields, ""] })}
                >
                  <Plus className="h-4 w-4" />
                  Lägg till bild
                </Button>
              </FormGroup>
            </FieldRow>
          </FieldStack>
        </FormShell>

        <section className="min-h-[320px] rounded-2xl border border-gray-200 bg-white p-2 shadow-theme-xs">
          {previewImages.length > 0 ? (
            <div className="grid h-[320px] grid-cols-2 grid-rows-2 gap-3 sm:h-[420px] xl:h-[520px]">
              {previewImages.map((imageUrl, index) => (
                <div
                  key={`${imageUrl}-${index}`}
                  className={
                    index === 0
                      ? "relative col-span-2 overflow-hidden rounded-xl bg-gray-100"
                      : "relative overflow-hidden rounded-xl bg-gray-100"
                  }
                >
                  <img
                    src={imageUrl}
                    alt={`Bild ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center text-sm text-gray-500 sm:h-[420px] xl:h-[520px]">
              Bildpreview visas här när länkar har lagts till.
            </div>
          )}
        </section>
      </div>
    </StepFormLayout>
  );
}
