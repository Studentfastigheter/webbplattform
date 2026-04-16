"use client";

import { FormGroup, FormShell, TextAreaField } from "@/components/Dashboard/Form";
import { useListingDraft } from "../listingDraftContext";

export default function DescriptionPage() {
  const { draft, updateDraft } = useListingDraft();

  return (
    <div className="mx-auto flex w-2xl flex-col items-center">
      <FormShell
        className="w-full"
        heading="Lägg till en beskrivning"
        description="Dela med dig av vad som är speciellt med boendet."
      >
        <FormGroup gap="md">
          <TextAreaField
            rows={6}
            placeholder="Skriv en beskrivning av bostaden"
            value={draft.description}
            onChange={(event) => updateDraft({ description: event.target.value })}
          />
        </FormGroup>
      </FormShell>
    </div>
  );
}
