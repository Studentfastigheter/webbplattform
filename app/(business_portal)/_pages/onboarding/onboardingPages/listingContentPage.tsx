"use client";

import { FormGroup, FormShell, MultiSelectCard, TextAreaField } from "@/components/Dashboard/Form";
import { useListingDraft } from "../listingDraftContext";
import { FieldRow, FieldStack, StepFormLayout } from "./listingFormUi";

const tagOptions = [
  { id: "BALCONY", label: "Balkong" },
  { id: "DISHWASHER", label: "Diskmaskin" },
  { id: "PARKING", label: "Parkering" },
  { id: "PET_FRIENDLY", label: "Husdjur tillåtna" },
  { id: "ELEVATOR", label: "Hiss" },
  { id: "LAUNDRY", label: "Tvättmöjlighet" },
  { id: "FURNISHED", label: "Möblerad" },
  { id: "INTERNET_INCLUDED", label: "Internet ingår" },
];

export default function ListingContentPage() {
  const { draft, updateDraft } = useListingDraft();

  const toggleTag = (id: string) => {
    updateDraft({
      tags: draft.tags.includes(id)
        ? draft.tags.filter((tag) => tag !== id)
        : [...draft.tags, id],
    });
  };

  return (
    <StepFormLayout>
      <FormShell
        className="m-0 max-w-none"
        heading="Text och taggar"
        description="Skriv en tydlig beskrivning och välj de taggar som passar bostaden."
      >
        <FieldStack>
          <FieldRow apiName="description" label="Beskrivning">
            <TextAreaField
              className="min-h-44 rounded-md border-gray-200 bg-white shadow-none focus-visible:border-[#004225] focus-visible:ring-[#004225]/15"
              rows={8}
              placeholder="Beskriv bostaden, läget, villkor och vad som ingår."
              value={draft.description}
              onChange={(event) => updateDraft({ description: event.target.value })}
            />
          </FieldRow>

          <div className="py-5 last:pb-0">
            <FormGroup heading="Taggar" gap="md" comment="Välj de taggar som är relevanta för annonsen.">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {tagOptions.map((option) => (
                  <MultiSelectCard
                    key={option.id}
                    id={option.id}
                    checked={draft.tags.includes(option.id)}
                    onCheckedChange={() => toggleTag(option.id)}
                    className="min-h-20 border-gray-200 bg-white transition-colors has-[[aria-checked=true]]:border-[#004225] has-[[aria-checked=true]]:bg-[#004225]/5"
                  >
                    <div>
                      <p className="text-sm font-medium">{option.label}</p>
                      <span className="mt-1 block text-xs text-gray-400">
                        {option.id}
                      </span>
                    </div>
                  </MultiSelectCard>
                ))}
              </div>
            </FormGroup>
          </div>
        </FieldStack>
      </FormShell>
    </StepFormLayout>
  );
}
