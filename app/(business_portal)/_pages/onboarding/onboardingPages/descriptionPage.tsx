"use client";

import { useState } from "react";
import { FormGroup, FormShell, TextAreaField } from "@/components/Dashboard/Form";

export default function DescriptionPage() {
    const [description, setDescription] = useState<string>("");
    return (
        <div className="flex flex-col items-center w-2xl mx-auto">
            <FormShell className="w-full" heading="Lägg till en beskrivning" description="Dela med dig av vad som är speciellt med ditt boende.">
                <FormGroup gap="md">
                    <TextAreaField
                        rows={6}
                        placeholder="Skriv en beskrivning av bostaden"
                        value={description !== null ? description.toString() : ""}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </FormGroup>
            </FormShell>
        </div>
    )
}