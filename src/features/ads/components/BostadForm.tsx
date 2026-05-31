
"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListingDetailDTO } from "@/types/listing";


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
import { InputField } from "@/features/business-portal/components/Form";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

type Props = {
  listing: ListingDetailDTO;
  children: React.ReactNode;
};


const getPropertyTypes = (locale: Locale) => [
    {
        value: "apartment",
        label: localizedText(locale, "Lägenhet", "Apartment"),
    },
    {
        value: "student_room",
        label: localizedText(locale, "Studentrum", "Student room"),
    },
    {
        value: "shared_room",
        label: localizedText(locale, "Rum i kollektiv", "Room in shared housing"),
    },
    {
        value: "room_in_private_home",
        label: localizedText(locale, "Inneboende", "Lodger room"),
    },
    {
        value: "villa",
        label: "Villa",
    },
    {
        value: "other",
        label: localizedText(locale, "Annat", "Other"),
    },
]


const getTagsOptions = (locale: Locale) => [
    { value: "furnished", label: localizedText(locale, "Möblerat", "Furnished") },
    { value: "free_of_points", label: localizedText(locale, "Poängfri", "No queue points") },
    { value: "balcony", label: localizedText(locale, "Balkong", "Balcony") },
    { value: "pets_allowed", label: localizedText(locale, "Husdjur tillåtna", "Pets allowed") },
    { value: "parking", label: localizedText(locale, "Parkering", "Parking") },
    { value: "dishwasher", label: localizedText(locale, "Diskmaskin", "Dishwasher") },
    { value: "elevator", label: localizedText(locale, "Hiss", "Elevator") },
    { value: "gym", label: "Gym" },
    { value: "laundry", label: localizedText(locale, "Tvättstuga", "Laundry room") },
    { value: "garden", label: localizedText(locale, "Trädgård", "Garden") },
];


export default function BostadForm({
    listing,
    children,
}: Props) {
    const { locale } = useI18n();
    const propertyTypes = getPropertyTypes(locale);
    const tagsOptions = getTagsOptions(locale);
    
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

            toast.success(localizedText(locale, "Din annons har sparats", "Your listing has been saved"), {
                action: {
                    label: localizedText(locale, "Ångra", "Undo"),
                    onClick: () => console.log("Undo"),
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
                        <DialogTitle>{localizedText(locale, "Redigera annons", "Edit listing")}</DialogTitle>
                        <DialogDescription>
                        {localizedText(locale, "Gör ändringar till din annons här. Tryck spara när du är klar med ändringarna.", "Make changes to your listing here. Press save when you are done.")}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 mt-4">
                        <div className="grid gap-3">
                            <Label htmlFor="title">{localizedText(locale, "Titel", "Title")}</Label>
                            <Input id="title" name="title" defaultValue={listing.title} />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="fullAddress">{localizedText(locale, "Adress", "Address")}</Label>
                            <Input id="fullAddress" name="fullAddress" defaultValue={listing.fullAddress ?? ""} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-3">
                                <Label htmlFor="area">{localizedText(locale, "Område", "Area")}</Label>
                                <Input id="area" name="area" defaultValue={listing.area} />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="city">{localizedText(locale, "Stad", "City")}</Label>
                                <Input id="city" name="city" defaultValue={listing.city} />
                            </div>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="rent">{localizedText(locale, "Månadshyra", "Monthly rent")}</Label>
                            <InputField
                                id="rent"
                                name="rent"
                                defaultValue={listing.rent}
                                type="number"
                                suffix={localizedText(locale, "kr/mån", "SEK/mo")}
                            />
                        </div>
                        <div className="grid gap-3">
                        <Label htmlFor="username-1">{localizedText(locale, "Typ av fastighet", "Property type")}</Label>
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
                                    : localizedText(locale, "Välj fastighet...", "Choose property...")}
                                <ChevronsUpDown className="opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                                <Command>
                                <CommandInput placeholder={localizedText(locale, "Sök...", "Search...")} className="h-9" />
                                <CommandList>
                                    <CommandEmpty>{localizedText(locale, "Ingen fastighetstyp hittades...", "No property type found...")}</CommandEmpty>
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
                                <Label htmlFor="rooms">{localizedText(locale, "Antal rum", "Number of rooms")}</Label>
                                <InputField 
                                    id="rooms" 
                                    name="rooms" 
                                    defaultValue={listing.rooms} 
                                    type="number"
                                    suffix={localizedText(locale, "rum", "rooms")}
                                />
                                
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="size">{localizedText(locale, "Storlek", "Size")}</Label>
                                <InputField 
                                    id="sizeM2" 
                                    name="sizeM2" 
                                    defaultValue={listing.sizeM2 ?? undefined} 
                                    type="number"
                                    suffix={localizedText(locale, "kvm", "sqm")}
                                />
                            </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="grid gap-3">
                                    <Label htmlFor="availableFrom">{localizedText(locale, "Tillgänglig från", "Available from")}</Label>
                                    <Input id="availableFrom" name="availableFrom" type="date" defaultValue={listing.availableFrom ?? ""} />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="availableTo">{localizedText(locale, "Tillgänglig till", "Available until")}</Label>
                                    <Input id="availableTo" name="availableTo" type="date" defaultValue={listing.availableTo ?? ""} />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="moveIn">{localizedText(locale, "Inflyttning", "Move-in")}</Label>
                                    <Input id="moveIn" name="moveIn" type="date" defaultValue={listing.moveIn ?? ""} />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="applyBy">{localizedText(locale, "Sista ansökan", "Apply by")}</Label>
                                    <Input id="applyBy" name="applyBy" type="date" defaultValue={listing.applyBy ?? ""} />
                                </div>
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="tags">{localizedText(locale, "Etiketter", "Tags")}</Label>
                                <div className="flex gap-2 flex-wrap">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div className="bg-black rounded-full h-7 w-7 grid items-center justify-center cursor-pointer">
                                            <Plus color="white" size={14} />
                                        </div>
                                    </PopoverTrigger>

                                    <PopoverContent>
                                    <Command>
                                        <CommandInput placeholder={localizedText(locale, "Sök...", "Search...")} />
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
                                <Label htmlFor="description">{localizedText(locale, "Beskrivning", "Description")}</Label>
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
                            <Button variant="outline">{localizedText(locale, "Avbryt", "Cancel")}</Button>
                        </DialogClose>
                        <Button type="submit">{localizedText(locale, "Spara ändringar", "Save changes")}</Button>
                    </DialogFooter>
                    </form>
                </DialogContent>
        </Dialog>
    )
}
