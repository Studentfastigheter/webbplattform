"use client";

import {
  AirVent,
  CookingPot,
  Dumbbell,
  ParkingMeter,
  SquareParking,
  Tv,
  UsersRound,
  WavesLadder,
  Wifi,
} from "lucide-react";
import { IconElevator } from "@tabler/icons-react";

import { FormGroup, FormShell, MultiSelectCard } from "@/components/Dashboard/Form";
import { useListingDraft } from "../listingDraftContext";

const favAmenitiesOptions = [
  {
    id: "ELEVATOR",
    label: "Hiss",
    icon: <IconElevator size={32} />,
  },
  {
    id: "WIFI",
    label: "Wifi",
    icon: <Wifi size={32} />,
  },
  {
    id: "TV",
    label: "TV",
    icon: <Tv size={32} />,
  },
  {
    id: "KITCHEN",
    label: "Kök",
    icon: <CookingPot size={32} />,
  },
  {
    id: "PARKING",
    label: "Gratis parkering inkluderad",
    icon: <SquareParking size={32} />,
  },
  {
    id: "PAID_PARKING",
    label: "Betalad parkering",
    icon: <ParkingMeter size={32} />,
  },
  {
    id: "AIR_CONDITIONING",
    label: "Luftkonditionering",
    icon: <AirVent size={32} />,
  },
];

const miscAmenitiesOptions = [
  {
    id: "POOL",
    label: "Pool",
    icon: <WavesLadder size={32} />,
  },
  {
    id: "GYM",
    label: "Gym",
    icon: <Dumbbell size={32} />,
  },
  {
    id: "SHARED_SPACES",
    label: "Gemensamma utrymmen",
    icon: <UsersRound size={32} />,
  },
];

export default function AmenitiesPage() {
  const { draft, updateDraft } = useListingDraft();
  const amenities = draft.tags;

  const handleCheckedChange = (id: string) => {
    if (amenities.includes(id)) {
      updateDraft({ tags: amenities.filter((amenity) => amenity !== id) });
      return;
    }

    updateDraft({ tags: [...amenities, id] });
  };

  return (
    <div className="mx-auto flex w-4xl flex-col">
      <FormShell
        mb="lg"
        className="max-w-none"
        heading="Lägg till bekvämligheter"
        description="Lägg till de bekvämligheter som ditt boende erbjuder."
      >
        <FormGroup heading="Finns några av dessa gästfavoriter?" gap="md">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {favAmenitiesOptions.map((option) => (
              <MultiSelectCard
                key={option.id}
                id={option.id}
                checked={amenities.includes(option.id)}
                onCheckedChange={() => handleCheckedChange(option.id)}
              >
                <div>
                  {option.icon}
                  <p className="ml-0.5 mt-2 font-medium">{option.label}</p>
                </div>
              </MultiSelectCard>
            ))}
          </div>
        </FormGroup>
        <FormGroup heading="Har ni några bekvämligheter som sticker ut från mängden?" gap="md">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {miscAmenitiesOptions.map((option) => (
              <MultiSelectCard
                key={option.id}
                id={option.id}
                checked={amenities.includes(option.id)}
                onCheckedChange={() => handleCheckedChange(option.id)}
              >
                <div>
                  {option.icon}
                  <p className="ml-0.5 mt-2 font-medium">{option.label}</p>
                </div>
              </MultiSelectCard>
            ))}
          </div>
        </FormGroup>
      </FormShell>
    </div>
  );
}
