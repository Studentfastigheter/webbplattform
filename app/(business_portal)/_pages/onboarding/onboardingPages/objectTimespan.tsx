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

export default function ObjectTimespan() {
  const { draft, updateDraft } = useListingDraft();

  return (
    <StepFormLayout>
      <FormShell
        className="m-0 max-w-none"
        heading="Datum"
        description="Lägg till datum om annonsen har deadline eller en bestämd tillgänglighet."
      >
        <FieldStack>
          <FieldGrid columns={3}>
            <FieldRow
              apiName="applyBy"
              label="Sista ansökningsdag"
              description="Valfritt."
            >
              <Input
                className={fieldInputClassName}
                type="date"
                value={draft.applyBy}
                onChange={(event) => updateDraft({ applyBy: event.target.value })}
              />
            </FieldRow>

            <FieldRow
              apiName="availableFrom"
              label="Tillgänglig från"
              description="Valfritt men rekommenderas."
            >
              <Input
                className={fieldInputClassName}
                type="date"
                value={draft.availableFrom}
                onChange={(event) =>
                  updateDraft({ availableFrom: event.target.value })
                }
              />
            </FieldRow>

            <FieldRow
              apiName="availableTo"
              label="Tillgänglig till"
              description="Valfritt."
            >
              <Input
                className={fieldInputClassName}
                type="date"
                value={draft.availableTo}
                onChange={(event) =>
                  updateDraft({ availableTo: event.target.value })
                }
              />
            </FieldRow>
          </FieldGrid>
        </FieldStack>
      </FormShell>
    </StepFormLayout>
  );
}
