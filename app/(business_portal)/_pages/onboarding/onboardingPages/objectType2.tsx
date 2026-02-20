"use client";

import { useState } from "react";
import { MultiselectButton, FormGroup, FormShell } from "@/components/Dashboard/Form";


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

    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedLegalType, setSelectedLegalType] = useState<string | null>(null);

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
                        checked={selectedType === type.id}
                        onCheckedChange={() => {
                            if (selectedType === type.id) {
                                setSelectedType(null);
                            } else {
                                setSelectedType(type.id)
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
                        checked={selectedLegalType === type.id}
                        onCheckedChange={() => {
                            if (selectedLegalType === type.id) {
                                setSelectedLegalType(null);
                            } else {
                                setSelectedLegalType(type.id)
                            }
                        }}
                    />
                ))}
            </FormGroup>
            
        </FormShell>
    );
}

