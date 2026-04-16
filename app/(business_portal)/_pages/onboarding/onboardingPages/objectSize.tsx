"use client";

import { FormGroup, FormShell, InputField } from "@/components/Dashboard/Form";
import { Dropdown } from "@/components/Dashboard/Dropdown";
import { SelectItem } from "@/components/ui/select";
import { useListingDraft } from "../listingDraftContext";

const NumberOfRooms = ["1", "1,5", "2", "3", "4"];
const NumberOfBedrooms = ["1", "2", "3", "4"];

export default function ObjectSize() {
  const { draft, updateDraft } = useListingDraft();

  return (
    <FormShell heading="Hur stor är bostaden?">
      <FormGroup heading="Storlek" gap="md">
        <InputField
          placeholder="Ange storlek"
          type="number"
          value={draft.sizeM2}
          onChange={(event) => updateDraft({ sizeM2: event.target.value })}
          suffix="kvm"
        />
      </FormGroup>

      <FormGroup
        heading="Antal rum"
        gap="md"
        comment="Sovrum är inkluderade i antal rum"
      >
        <Dropdown
          placeholder="Antal rum"
          value={draft.rooms}
          onValueChange={(rooms) => updateDraft({ rooms })}
        >
          {NumberOfRooms.map((room) => (
            <SelectItem key={room} value={room}>
              {room} rum
            </SelectItem>
          ))}
        </Dropdown>
      </FormGroup>

      <FormGroup heading="Antal sovrum" gap="md" optional>
        <Dropdown
          placeholder="Antal sovrum"
          value={draft.bedrooms}
          onValueChange={(bedrooms) => updateDraft({ bedrooms })}
        >
          {NumberOfBedrooms.map((bedroom) => (
            <SelectItem key={bedroom} value={bedroom}>
              {bedroom} sovrum
            </SelectItem>
          ))}
        </Dropdown>
      </FormGroup>
    </FormShell>
  );
}
