"use client";

import { FormGroup, FormShell } from "@/components/Dashboard/Form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useListingDraft, type PortalDwellingType } from "../listingDraftContext";
import {
  FieldGrid,
  FieldRow,
  FieldStack,
  StepFormLayout,
  fieldInputClassName,
} from "./listingFormUi";

export default function AddObjectInfo() {
  const { draft, updateDraft } = useListingDraft();

  return (
    <StepFormLayout>
      <FormShell
        className="m-0 max-w-none"
        heading="Grunddata"
        description="Börja med annonsens titel, plats och bostadstyp."
      >
        <FieldStack>
          <FieldRow apiName="title" label="Titel">
            <Input
              className={fieldInputClassName}
              placeholder="Ex: 3:a nära Chalmers"
              value={draft.title}
              onChange={(event) => updateDraft({ title: event.target.value })}
            />
          </FieldRow>

          <FieldGrid>
            <FieldRow apiName="city" label="Stad">
              <Input
                className={fieldInputClassName}
                placeholder="Göteborg"
                value={draft.city}
                onChange={(event) => updateDraft({ city: event.target.value })}
              />
            </FieldRow>

            <FieldRow
              apiName="area"
              label="Område"
              description="Valfritt, men hjälper studenter förstå läget snabbare."
            >
              <Input
                className={fieldInputClassName}
                placeholder="Johanneberg"
                value={draft.area}
                onChange={(event) => updateDraft({ area: event.target.value })}
              />
            </FieldRow>
          </FieldGrid>

          <FieldRow apiName="address" label="Adress">
            <Input
              className={fieldInputClassName}
              placeholder="Gibraltargatan 82"
              value={draft.address}
              onChange={(event) => updateDraft({ address: event.target.value })}
            />
          </FieldRow>

          <FormGroup heading="Boendetyp" gap="md" className="mb-0 py-5 last:pb-0">
            <FieldRow apiName="dwellingType" label="Välj boendetyp">
              <Select
                value={draft.dwellingType}
                onValueChange={(value) =>
                  updateDraft({ dwellingType: value as PortalDwellingType })
                }
              >
                <SelectTrigger className={`w-full ${fieldInputClassName}`}>
                  <SelectValue placeholder="Välj boendetyp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APARTMENT">Lägenhet</SelectItem>
                  <SelectItem value="ROOM">Rum</SelectItem>
                  <SelectItem value="CORRIDOR_ROOM">Korridorsrum</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
          </FormGroup>
        </FieldStack>
      </FormShell>
    </StepFormLayout>
  );
}
