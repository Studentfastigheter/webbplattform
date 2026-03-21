"use client";

import { useState } from "react";
import { FormGroup, FormShell, MultiSelectCard, TextAreaField } from "@/components/Dashboard/Form";
import { AirVent, CircleQuestionMark, CookingPot, Dumbbell, ParkingMeter, SquareParking, Tv, UsersRound, WavesLadder, Wifi } from "lucide-react";
import { IconElevator } from "@tabler/icons-react";



const favAmenitiesOptions = [
    
    {
        id: "elevator",
        label: "Hiss",
        icon: <IconElevator size={32} />
    },
    {
        id: "wifi",
        label: "Wifi",
        icon: <Wifi size={32} />
    },
    {
        id: "tv",
        label: "TV",
        icon: <Tv size={32} />
    },
    {
        id: "kitchen",
        label: "Kök",
        icon: <CookingPot size={32} />
    },
    {
        id: "free_parking",
        label: "Gratis parkering inkluderad",
        icon: <SquareParking size={32} />
    },
    {
        id: "payed_parking",
        label: "Betalad parkering",
        icon: <ParkingMeter size={32} />
    },
    {
        id: "air_conditioning",
        label: "Luftkonditionering",
        icon: <AirVent size={32} />
    },
]

const miscAmenitiesOptions = [
    {
        id: "pool",
        label: "Pool",
        icon: <WavesLadder size={32} />
    },
    {
        id: "gym",
        label: "Gym",
        icon: <Dumbbell size={32} />
    },
    {
        id: "shared_spaces",
        label: "Gemensamma utrymmen",
        icon: <UsersRound size={32} />
    }
]

export default function AmenitiesPage() {

    const [amenities, setAmenities] = useState<string[]>([]);

    const handleCheckedChange = (id: string) => {
        if (amenities.includes(id)) {
            setAmenities(amenities.filter((amenity) => amenity !== id));
        } else {
            setAmenities([...amenities, id]);
        }
    };

    return (
        <div className="flex flex-col w-4xl mx-auto">
            <FormShell mb="lg" className="max-w-none" heading="Lägg till bekvämligheter" description="Lägg till de bekvämligheter som ditt boende erbjuder.">
                <FormGroup heading="Finns några av dessa gästfavoriter?" gap="md">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {favAmenitiesOptions.map((option) => (
                            <MultiSelectCard
                                key={option.id}
                                id={option.id}
                                checked={amenities.includes(option.id)}
                                onCheckedChange={() => handleCheckedChange(option.id)}
                            >
                                <div>
                                    {option.icon}
                                    <p className="font-medium mt-2 ml-0.5">{option.label}</p>
                                </div>
                            </MultiSelectCard>
                        ))}
                    </div>
                </FormGroup>
                <FormGroup heading="Har ni några bekvämligheter som sticker ut från mängden?" gap="md">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {miscAmenitiesOptions.map((option) => (
                            <MultiSelectCard
                                key={option.id}
                                id={option.id}
                                checked={amenities.includes(option.id)}
                                onCheckedChange={() => handleCheckedChange(option.id)}
                            >
                                <div>
                                    {option.icon}
                                    <p className="font-medium mt-2 ml-0.5">{option.label}</p>
                                </div>
                            </MultiSelectCard>
                        ))}
                    </div>
                </FormGroup>
            </FormShell>
        </div>
    )
}