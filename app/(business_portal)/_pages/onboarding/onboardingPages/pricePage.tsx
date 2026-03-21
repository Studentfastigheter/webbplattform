"use client";

import { useEffect, useState } from "react";
import { FormGroup, FormShell, InputField, MultiselectButton, TextAreaField } from "@/components/Dashboard/Form";


const INCLUDED_OPTIONS = [
    {
        id: "electricity",
        label: "Elektricitet",
    },
    {
        id: "warm_water",
        label: "Varmvatten",
    },
    {
        id: "internet",
        label: "Bredband",
    },
]



export default function PricePage() {
    const [price, setPrice] = useState<string>("");

    const [included, setIncluded] = useState<string[]>([]);



    useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore typing inside real inputs/textareas
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      // Allow digits
      if (/^[0-9]$/.test(e.key)) {
        setPrice((prev) => prev + e.key);
      }

      // Backspace
      if (e.key === "Backspace") {
        setPrice((prev) => prev.slice(0, -1));
      }

      // Optional: clear with Escape
      if (e.key === "Escape") {
        setPrice("");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);


  const formattedPrice = price === ""
      ? ""
      : Number(price).toLocaleString("sv-SE");



    return (
        <div className="flex flex-col items-center w-sm mx-auto">
            <FormShell className="w-full text-center flex flex-col items-center" heading="Ange ett grundpris" description="Detta är priset som kommer att visas i annonsen.">
                <div className="mt-12 mb-24">
                    <p className="text-6xl font-semibold text-center">{formattedPrice}kr</p>
                </div>
            </FormShell>
            <FormGroup heading="Vad ingår i priset?" className="mb-8 w-full">
                {INCLUDED_OPTIONS.map((option) => (
                    <MultiselectButton
                        key={option.id}
                        id={option.id}
                        label={option.label}
                        checked={included.includes(option.id)}
                        onCheckedChange={() => {
                            if (included.includes(option.id)) {
                                setIncluded(included.filter((item) => item !== option.id));
                            } else {
                                setIncluded([...included, option.id]);
                            }
                        }}
                    />
                ))}
                
            </FormGroup>
        </div>
    )
}