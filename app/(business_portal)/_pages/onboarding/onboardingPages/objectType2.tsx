"use client";

import { MultiselectButton, FormGroup, FormShell } from "@/components/Dashboard/Form";
import { useListingDraft, type PortalDwellingType } from "../listingDraftContext";


const ObjectTypes = [
    {
        id: "apartment",
        label: "Lägenhet",
    },
    {
        id: "villa",
        label: "Villa",
    },
    {
        id: "townhouse",
        label: "Radhus",
    },
    {
        id: "cabin",
        label: "Stuga",    
    },
    {
        id: "semi_detached",
        label: "Parhus",
    },
    {
        id: "corridor",
        label: "Korridorsrum",
    },
    {
        id: "other",
        label: "Övrigt",
    }
]

const dwellingTypeByObjectType: Record<string, PortalDwellingType> = {
    apartment: "APARTMENT",
    villa: "APARTMENT",
    townhouse: "APARTMENT",
    cabin: "APARTMENT",
    semi_detached: "APARTMENT",
    corridor: "CORRIDOR_ROOM",
    other: "APARTMENT",
};

const ObjectLegalTypes = [
    {
        id: "bostadsratt",
        label: "Bostadsrätt",
    },
    {
        id: "hyresratt",
        label: "Hyresrätt",
    }
]


export default function ObjectType2() {
    const { draft, updateDraft } = useListingDraft();

    return (
        <FormShell heading="Vilken typ av bostad är det?">

            <FormGroup 
                className="mb-8" 
                comment="Välj övrigt om ingen av de andra kategorierna passar."
            >
                {ObjectTypes.map((type) => (
                    <MultiselectButton
                        key={type.id}
                        id={type.id}
                        label={type.label}
                        checked={draft.objectType === type.id}
                        onCheckedChange={() => {
                            if (draft.objectType === type.id) {
                                updateDraft({ objectType: "" });
                            } else {
                                updateDraft({
                                    objectType: type.id,
                                    dwellingType: dwellingTypeByObjectType[type.id] ?? "APARTMENT",
                                });
                            }
                        }}
                    />
                ))}
            </FormGroup>
            <FormGroup heading="Bostadsform" className="mb-8">
                {ObjectLegalTypes.map((type) => (
                    <MultiselectButton
                        key={type.id}
                        id={type.id}
                        label={type.label}
                        checked={draft.legalType === type.id}
                        onCheckedChange={() => {
                            if (draft.legalType === type.id) {
                                updateDraft({ legalType: "" });
                            } else {
                                updateDraft({ legalType: type.id });
                            }
                        }}
                    />
                ))}
            </FormGroup>
            
        </FormShell>
    );
}

