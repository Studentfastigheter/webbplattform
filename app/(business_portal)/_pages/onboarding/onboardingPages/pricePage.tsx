"use client";

import { useEffect } from "react";

import { FormGroup, FormShell, InputField, MultiselectButton } from "@/components/Dashboard/Form";
import { useListingDraft } from "../listingDraftContext";

const INCLUDED_OPTIONS = [
  {
    id: "ELECTRICITY_INCLUDED",
    label: "Elektricitet",
  },
  {
    id: "WARM_WATER_INCLUDED",
    label: "Varmvatten",
  },
  {
    id: "INTERNET_INCLUDED",
    label: "Bredband",
  },
];

export default function PricePage() {
  const { draft, updateDraft } = useListingDraft();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (/^[0-9]$/.test(event.key)) {
        updateDraft({ rent: draft.rent + event.key });
      }

      if (event.key === "Backspace") {
        updateDraft({ rent: draft.rent.slice(0, -1) });
      }

      if (event.key === "Escape") {
        updateDraft({ rent: "" });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [draft.rent, updateDraft]);

  const formattedPrice =
    draft.rent === "" ? "" : Number(draft.rent).toLocaleString("sv-SE");

  return (
    <div className="mx-auto flex w-sm flex-col items-center">
      <FormShell
        className="flex w-full flex-col items-center text-center"
        heading="Ange ett grundpris"
        description="Detta är priset som kommer att visas i annonsen."
      >
        <div className="mb-8 mt-10 w-full">
          <p className="mb-4 text-6xl font-semibold text-center">
            {formattedPrice}kr
          </p>
          <InputField
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Hyra per månad"
            value={draft.rent}
            onChange={(event) =>
              updateDraft({ rent: event.target.value.replace(/\D/g, "") })
            }
            suffix="kr"
          />
        </div>
      </FormShell>

      <FormGroup heading="Vad ingår i priset?" className="mb-8 w-full">
        {INCLUDED_OPTIONS.map((option) => (
          <MultiselectButton
            key={option.id}
            id={option.id}
            label={option.label}
            checked={draft.includedInRent.includes(option.id)}
            onCheckedChange={() => {
              if (draft.includedInRent.includes(option.id)) {
                updateDraft({
                  includedInRent: draft.includedInRent.filter(
                    (item) => item !== option.id,
                  ),
                });
                return;
              }

              updateDraft({ includedInRent: [...draft.includedInRent, option.id] });
            }}
          />
        ))}
      </FormGroup>
    </div>
  );
}
