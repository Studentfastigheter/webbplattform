"use client";

import { useState } from "react";
import { FormGroup, FormShell, TextAreaField } from "@/components/Dashboard/Form";

export default function TitlePage() {
    const [title, setTitle] = useState<string>("");
    return (
        <div className="flex flex-col items-center w-2xl mx-auto">
            <FormShell className="w-full" heading="Ge ditt boende ett namn" description="Korta titlar funkar bäst. Oroa dig inte, du kan alltid ändra den senare.">
                <FormGroup gap="md">
                    <TextAreaField
                        rows={6}
                        placeholder="Ex: 3:a i centrala Göteborg"
                        value={title !== null ? title.toString() : ""}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </FormGroup>
            </FormShell>
        </div>
    )
}