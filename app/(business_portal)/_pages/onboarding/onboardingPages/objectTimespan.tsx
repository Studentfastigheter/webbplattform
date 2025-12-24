"use client";

import { useState } from "react";
import { MultiselectButton, FormGroup, FormShell } from "@/components/Dashboard/Form";


const MOVE_IN_OPTIONS = [
    {
        id: "soonest_possible",
        label: "Snarast möjligt",
    },
    {
        id: "choose_date",
        label: "Välj datum",
    },
]

const MOVE_OUT_OPTIONS = [
    {
        id: "until_further_notice",
        label: "Tills vidare",
    },
    {
        id: "choose_date",
        label: "Välj datum",
    },
]



export default function ObjectType() {

	const [moveIn, setMoveIn] = useState<string | null>(null);
	const [moveOut, setMoveOut] = useState<string | null>(null);
	

    return (
        <FormShell title="Vad vill du hyra ut?">

            <FormGroup title="Välj lägenhet" className="mb-8">
                {MOVE_IN_OPTIONS.map((type) => (
                    <MultiselectButton
                        key={type.id}
                        id={type.id}
                        label={type.label}
                        checked={moveIn === type.id}
                        onCheckedChange={() => {
                            if (moveIn === type.id) {
                                setMoveIn(null);
                            } else {
                                setMoveIn(type.id)
                            }
                        }}
                    />
                ))}
            </FormGroup>
            
            <FormGroup title="Välj möblering">
                {MOVE_OUT_OPTIONS.map((option) => (
                    <MultiselectButton
                        key={option.id}
                        id={option.id}
                        label={option.label}
                        checked={moveOut === option.id}
                        onCheckedChange={() => {
                            if (moveOut === option.id) {
                                setMoveOut(null);
                            } else {
                                setMoveOut(option.id)
                            }
                        }}
                    />
                ))}
            </FormGroup>
        </FormShell>
    );
}

