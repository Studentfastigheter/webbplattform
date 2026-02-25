"use client";

import { useState } from "react";
import { FormGroup, FormShell, InputField } from "@/components/Dashboard/Form";
import { SelectItem } from "@/components/ui/select";
import { Dropdown } from "@/components/Dashboard/Dropdown";


const NumberOfRooms = [
    "1", "1,5", "2", "3", "4"
]

const NumberOfBedrooms = [
    "1", "2", "3", "4"
]



export default function ObjectSize() {

    const [size, setSize] = useState<number | null>(null);
    const [rooms, setRooms] = useState<number | null>(null);
    const [bedrooms, setBedrooms] = useState<number | null>(null);


    return (
        <FormShell heading="Hur stor är bostaden?">

            <FormGroup heading="Storlek" gap="md">
                <InputField
                    placeholder="Ange storlek"
                    type="number"
                    value={size !== null ? size.toString() : ""}
                    onChange={(e) => setSize(e.target.value ? parseInt(e.target.value) : null)}
                    suffix="kvm"
                />
            </FormGroup>

            <FormGroup 
                heading="Antal rum" 
                gap="md"
                comment="Sovrum är inkluderade i antal rum"
            >
                <Dropdown placeholder="Antal rum">
                    {NumberOfRooms.map((room) => (
                        <SelectItem key={room.toString()} value={room.toString()}>
                            {room} rum
                        </SelectItem>
                    ))}
                </Dropdown>
            </FormGroup>

            <FormGroup 
                heading="Antal sovrum" 
                gap="md" 
                optional
            >
                <Dropdown placeholder="Antal sovrum">
                    {NumberOfBedrooms.map((bedroom) => (
                        <SelectItem key={bedroom.toString()} value={bedroom.toString()}>
                            {bedroom} sovrum
                        </SelectItem>
                    ))}
                </Dropdown>
            </FormGroup>
            
        </FormShell>

    );
}

