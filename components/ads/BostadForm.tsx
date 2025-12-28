
"use client"

import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ListingDetail } from "./types";


import * as React from "react"
import { Check, ChevronsUpDown, Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { InputField } from "../Dashboard/Form";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";

type Props = {
  listing: ListingDetail;
  children: React.ReactNode;
};


const propertyTypes = [
    {
        value: "apartment",
        label: "Lägenhet",
    },
    {
        value: "student_room",
        label: "Studentrum",
    },
    {
        value: "shared_room",
        label: "Rum i kollektiv",
    },
    {
        value: "room_in_private_home",
        label: "Inneboende",
    },
    {
        value: "villa",
        label: "Villa",
    },
    {
        value: "other",
        label: "Annat",
    },
]


const tagsOptions = [
    { value: "furnished", label: "Möblerat" },
    { value: "free_of_points", label: "Poängfri" },
    { value: "balcony", label: "Balkong" },
    { value: "pets_allowed", label: "Husdjur tillåtna" },
    { value: "parking", label: "Parkering" },
    { value: "dishwasher", label: "Diskmaskin" },
    { value: "elevator", label: "Hiss" },
    { value: "gym", label: "Gym" },
    { value: "laundry", label: "Tvättstuga" },
    { value: "garden", label: "Trädgård" },
];


const defaultRooms = 3;
const defaultSize = 42;




export default function BostadForm({
    listing,
    children,
}: Props) {
    
    // Property type select state
    const [propertyOpen, setPropertyOpen] = useState(false)
    const [propertyValue, setPropertyValue] = useState("")

    // Tags multi-select state
    const [selected, setSelected] = useState<string[]>(["furnished", "balcony"]);

    // Form open state
    const [formOpen, setFormOpen] = useState(false);



    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
                                
        const ok = true; // Implementera validering
        if (ok) {
            setFormOpen(false);

            toast.success("Din annons har sparats", {
                action: {
                    label: "Ångra",
                    onClick: () => console.log("Ångra"),
                },
            })
        }
    }

    return (
        <Dialog open={formOpen} onOpenChange={(open) => setFormOpen(open)}>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px] max-h-4/5 overflow-y-auto">
                
                    <form
                        onSubmit={handleSubmit}
                    >
                    <DialogHeader>
                        <DialogTitle>Redigera annons</DialogTitle>
                        <DialogDescription>
                        Gör ändringar till din annons här. Tryck spara när du är klar med ändringarna.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 mt-4">
                        <div className="grid gap-3">
                            <Label htmlFor="title">Titel</Label>
                            <Input id="title" name="title" defaultValue={listing.title} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-3">
                                <Label htmlFor="area">Område</Label>
                                <Input id="area" name="area" defaultValue={listing.area} />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="city">Stad</Label>
                                <Input id="city" name="city" defaultValue={listing.city} />
                            </div>
                        </div>
                        <div className="grid gap-3">
                        <Label htmlFor="username-1">Typ av fastighet</Label>
                        <Popover open={propertyOpen} onOpenChange={setPropertyOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={propertyOpen}
                                className="w-[200px] justify-between"
                                >
                                {propertyValue
                                    ? propertyTypes.find((propertyType) => propertyType.value === propertyValue)?.label
                                    : "Välj fastighet..."}
                                <ChevronsUpDown className="opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                                <Command>
                                <CommandInput placeholder="Sök..." className="h-9" />
                                <CommandList>
                                    <CommandEmpty>Ingen fastighetstyp hittades...</CommandEmpty>
                                    <CommandGroup>
                                        {propertyTypes.map((propertyType) => (
                                            <CommandItem
                                            key={propertyType.value}
                                            value={propertyType.value}
                                            onSelect={(currentValue) => {
                                                setPropertyValue(currentValue === propertyValue ? "" : currentValue)
                                                setPropertyOpen(false)
                                            }}
                                            >
                                            {propertyType.label}
                                            <Check
                                                className={cn(
                                                "ml-auto",
                                                propertyValue === propertyType.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-3">
                                <Label htmlFor="rooms">Antal rum</Label>
                                <InputField 
                                    id="rooms" 
                                    name="rooms" 
                                    defaultValue={defaultRooms} 
                                    type="number"
                                    suffix="rum"
                                />
                                
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="size">Storlek</Label>
                                <InputField 
                                    id="rooms" 
                                    name="rooms" 
                                    defaultValue={defaultSize} 
                                    type="number"
                                    suffix="kvm"
                                />
                            </div>
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="tags">Etiketter</Label>
                                <div className="flex gap-2 flex-wrap">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div className="bg-black rounded-full h-7 w-7 grid items-center justify-center cursor-pointer">
                                            <Plus color="white" size={14} />
                                        </div>
                                    </PopoverTrigger>

                                    <PopoverContent>
                                    <Command>
                                        <CommandInput placeholder="Search…" />
                                        <CommandList>
                                            {tagsOptions.map((o) => (
                                                <CommandItem
                                                key={o.value}
                                                value={o.value}
                                                onSelect={() => {
                                                    setSelected((prev) =>
                                                    prev.includes(o.value)
                                                        ? prev.filter((v) => v !== o.value)
                                                        : [...prev, o.value]
                                                    );
                                                }}
                                                >
                                                    {o.label}
                                                    {selected.includes(o.value) && <Check />}
                                                </CommandItem>
                                            ))}
                                        </CommandList>
                                    </Command>
                                    </PopoverContent>
                                </Popover>
                                {
                                selected.map((tag) => {
                                    const tagObj = tagsOptions.find((o) => o.value === tag);
                                    if (!tagObj) return null;
                                    return (
                                        <Button 
                                            key={tagObj.value}
                                            variant="outline" 
                                            className="group text-xs h-7 px-3 rounded-full flex gap-1"
                                            onClick={() => 
                                                setSelected((prev) =>
                                                    prev.filter((value) => value !== tagObj.value)
                                                )
                                            }
                                        >
                                            {tagObj.label}
                                            <X height={14} />
                                        </Button>
                                    )
                                })
                                }
                                
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="description">Beskrivning</Label>
                                <Textarea 
                                    id="description" 
                                    name="description" 
                                    defaultValue={listing.description}
                                    className="h-48 resize-none"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <DialogClose asChild>
                            <Button variant="outline">Avbryt</Button>
                        </DialogClose>
                        <Button type="submit">Spara ändringar</Button>
                    </DialogFooter>
                    </form>
                </DialogContent>
        </Dialog>
    )
}