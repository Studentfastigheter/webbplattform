"use client";

import { FormGroup, FormShell, TextAreaField } from "@/components/Dashboard/Form";
import { useListingDraft } from "../listingDraftContext";

export default function TitlePage() {
  const { draft, updateDraft } = useListingDraft();

  return (
    <div className="mx-auto flex w-2xl flex-col items-center">
      <FormShell
        className="w-full"
        heading="Ge ditt boende ett namn"
        description="Korta titlar funkar bäst. Du kan ändra den senare."
      >
        <FormGroup gap="md">
          <TextAreaField
            rows={6}
            placeholder="Ex: 3:a i centrala Göteborg"
            value={draft.title}
            onChange={(event) => updateDraft({ title: event.target.value })}
          />
        </FormGroup>
      </FormShell>
    </div>
  );
}
