"use client";

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"

import { useState } from "react";
import { MultiselectButton, FormGroup, FormShell } from "@/components/Dashboard/Form";
import { sv } from "date-fns/locale/sv";


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

    const [moveInDate, setMoveInDate] = useState<Date>();
    const [moveOutDate, setMoveOutDate] = useState<Date>();

	

    return (
        <FormShell heading="Välj in- och utflyttningsdatum">

            <FormGroup heading="Inflyttning" className="mb-8">
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
                
                {
                    moveIn === "choose_date" && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant="outline"
                                data-empty={!moveInDate}
                                className="data-[empty=true]:text-muted-foreground w-[212px] justify-between text-left font-normal"
                                >
                                {moveInDate ? format(moveInDate, "PPP", { locale: sv }) : <span>Välj ett datum</span>}
                                <CalendarIcon className="w-4 h-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                mode="single"
                                selected={moveInDate}
                                onSelect={setMoveInDate}
                                defaultMonth={moveInDate}
                                />
                            </PopoverContent>
                        </Popover>
                    )
                }
            </FormGroup>
            
            <FormGroup heading="Utflyttning">
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
                {
                    moveOut === "choose_date" && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant="outline"
                                data-empty={!moveOutDate}
                                className="data-[empty=true]:text-muted-foreground w-[212px] justify-between text-left font-normal"
                                >
                                {moveOutDate ? format(moveOutDate, "PPP", { locale: sv }) : <span>Välj ett datum</span>}
                                <CalendarIcon className="w-4 h-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                mode="single"
                                selected={moveOutDate}
                                onSelect={setMoveOutDate}
                                defaultMonth={moveOutDate}
                                />
                            </PopoverContent>
                        </Popover>
                    )
                }
            </FormGroup>
        </FormShell>
    );
}

