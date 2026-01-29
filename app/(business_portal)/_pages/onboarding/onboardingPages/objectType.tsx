"use client";

import { useState } from "react";
import { MultiselectButton, FormGroup, FormShell } from "@/components/Dashboard/Form";


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

	const [selectedType, setSelectedType] = useState<string | null>(null);
	const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null);

    return (
        <FormShell title="Vad vill du hyra ut?">

            <FormGroup title="Välj lägenhet" className="mb-8">
                {ObjectTypes.map((type) => (
                    <MultiselectButton
                        key={type.id}
                        id={type.id}
                        label={type.label}
                        description={type.description}
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
            
            <FormGroup title="Välj möblering">
                {WithFurnitureOptions.map((option) => (
                    <MultiselectButton
                        key={option.id}
                        id={option.id}
                        label={option.label}
                        checked={selectedFurniture === option.id}
                        onCheckedChange={() => {
                            if (selectedFurniture === option.id) {
                                setSelectedFurniture(null);
                            } else {
                                setSelectedFurniture(option.id)
                            }
                        }}
                    />
                ))}
            </FormGroup>
        </FormShell>
    );
}

