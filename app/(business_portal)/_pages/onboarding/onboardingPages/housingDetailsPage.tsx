"use client";

import { FormShell } from "@/components/Dashboard/Form";
import { Input } from "@/components/ui/input";
import { useListingDraft } from "../listingDraftContext";
import {
  FieldGrid,
  FieldRow,
  FieldStack,
  StepFormLayout,
  fieldInputClassName,
} from "./listingFormUi";

function NumberInput({
  min,
  onChange,
  placeholder,
  step,
  suffix,
  value,
}: {
  min?: string;
  onChange: (value: string) => void;
  placeholder: string;
  step?: string;
  suffix?: string;
  value: string;
}) {
  return (
    <div className="relative">
      <Input
        className={suffix ? `${fieldInputClassName} pr-14` : fieldInputClassName}
        inputMode="decimal"
        min={min}
        placeholder={placeholder}
        step={step}
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
          {suffix}
        </span>
      )}
    </div>
  );
}

export default function HousingDetailsPage() {
  const { draft, updateDraft } = useListingDraft();

  return (
    <StepFormLayout>
      <FormShell
        className="m-0 max-w-none"
        heading="Yta, rum och hyra"
        description="Ange de numeriska uppgifterna som visas i annonskortet."
      >
        <FieldStack>
          <FieldGrid columns={3}>
            <FieldRow apiName="rooms" label="Antal rum">
              <NumberInput
                min="0"
                placeholder="1.5"
                step="0.5"
                value={draft.rooms}
                onChange={(rooms) => updateDraft({ rooms })}
              />
            </FieldRow>

            <FieldRow apiName="sizeM2" label="Storlek">
              <NumberInput
                min="0"
                placeholder="42"
                step="0.1"
                suffix="m²"
                value={draft.sizeM2}
                onChange={(sizeM2) => updateDraft({ sizeM2 })}
              />
            </FieldRow>

            <FieldRow apiName="rent" label="Hyra">
              <NumberInput
                min="0"
                placeholder="6200"
                step="1"
                suffix="kr"
                value={draft.rent}
                onChange={(rent) => updateDraft({ rent })}
              />
            </FieldRow>
          </FieldGrid>
        </FieldStack>
      </FormShell>
    </StepFormLayout>
  );
}
