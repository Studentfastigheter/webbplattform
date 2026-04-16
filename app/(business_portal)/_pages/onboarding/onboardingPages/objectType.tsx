"use client";

import { MultiselectButton, FormGroup, FormShell } from "@/components/Dashboard/Form";
import { useListingDraft } from "../listingDraftContext";


const ObjectTypes = [
    {
        id: "apartment_rental",
        label: "En hel bostad",
        description: "Hyresgästen har hela bostaden för sig själv.",
    },
    {
        id: "shared_room",
        label: "Delad bostad",
        description: "Hyresgästen delar bostaden med andra.",
    },
]

const WithFurnitureOptions = [
    {
        id: "furnished",
        label: "Möblerad",
    },
    {
        id: "unfurnished",
        label: "Omöblerad",
    },
    {
        id: "partially_furnished",
        label: "Delvis möblerad",
    }
]



export default function ObjectType() {
	const { draft, updateDraft } = useListingDraft();

    return (
        <FormShell heading="Vad vill du hyra ut?">

            <FormGroup heading="Välj lägenhet" className="mb-8">
                {ObjectTypes.map((type) => (
                    <MultiselectButton
                        key={type.id}
                        id={type.id}
                        label={type.label}
                        description={type.description}
                        checked={draft.rentalMode === type.id}
                        onCheckedChange={() => {
                            if (draft.rentalMode === type.id) {
                                updateDraft({ rentalMode: "" });
                            } else {
                                updateDraft({
                                    rentalMode: type.id,
                                    dwellingType: type.id === "shared_room" ? "ROOM" : draft.dwellingType,
                                });
                            }
                        }}
                    />
                ))}
            </FormGroup>
            
            <FormGroup heading="Välj möblering">
                {WithFurnitureOptions.map((option) => (
                    <MultiselectButton
                        key={option.id}
                        id={option.id}
                        label={option.label}
                        checked={draft.furnishing === option.id}
                        onCheckedChange={() => {
                            if (draft.furnishing === option.id) {
                                updateDraft({ furnishing: "" });
                            } else {
                                updateDraft({ furnishing: option.id });
                            }
                        }}
                    />
                ))}
            </FormGroup>
        </FormShell>
    );
}

