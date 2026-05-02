"use client";

import type { ReactNode } from "react";
import {
  CalendarDays,
  Home,
  ImageIcon,
  MapPin,
  Plus,
  Tags,
  Trash2,
} from "lucide-react";

import { MultiSelectCard, TextAreaField } from "@/components/Dashboard/Form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useListingDraft, type PortalDwellingType } from "../listingDraftContext";
import { StepFormLayout, fieldInputClassName } from "./listingFormUi";

const MIN_IMAGE_FIELDS = 3;

const tagOptions = [
  { id: "BALCONY", label: "Balkong" },
  { id: "DISHWASHER", label: "Diskmaskin" },
  { id: "PARKING", label: "Parkering" },
  { id: "PET_FRIENDLY", label: "Husdjur tillåtna" },
  { id: "ELEVATOR", label: "Hiss" },
  { id: "LAUNDRY", label: "Tvättmöjlighet" },
  { id: "FURNISHED", label: "Möblerad" },
  { id: "INTERNET_INCLUDED", label: "Internet ingår" },
];

const polishedInputClassName = `${fieldInputClassName} border-gray-200 bg-gray-50/70 shadow-none hover:border-gray-300 hover:bg-white focus-visible:bg-white`;
const polishedTextareaClassName =
  "min-h-32 rounded-md border-gray-200 bg-gray-50/70 shadow-none transition-colors placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus-visible:border-[#004225] focus-visible:bg-white focus-visible:ring-[#004225]/15";

function normalizeImages(images: string[]) {
  const next = [...images];
  while (next.length < MIN_IMAGE_FIELDS) next.push("");
  return next;
}

function FormField({
  children,
  description,
  label,
  required,
}: {
  children: ReactNode;
  description?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-[#004225]">*</span>}
      </span>
      {children}
      {description && (
        <span className="text-xs leading-5 text-gray-500">{description}</span>
      )}
    </label>
  );
}

function NumberInput({
  min,
  onChange,
  placeholder,
  step,
  suffix,
  value,
}: {
  min?: string;
  onChange: (value: string) => void;
  placeholder: string;
  step?: string;
  suffix?: string;
  value: string;
}) {
  return (
    <div className="relative">
      <Input
        className={suffix ? `${polishedInputClassName} pr-14` : polishedInputClassName}
        inputMode="decimal"
        min={min}
        placeholder={placeholder}
        step={step}
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
          {suffix}
        </span>
      )}
    </div>
  );
}

function CompactSection({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className="grid gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-8">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#004225]/10 text-[#004225]">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-950">{title}</h2>
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default function CreateListingPage() {
  const { draft, updateDraft } = useListingDraft();
  const imageFields = normalizeImages(draft.images);

  const toggleTag = (id: string) => {
    updateDraft({
      tags: draft.tags.includes(id)
        ? draft.tags.filter((tag) => tag !== id)
        : [...draft.tags, id],
    });
  };

  const updateImage = (index: number, value: string) => {
    const next = normalizeImages(draft.images);
    next[index] = value;
    updateDraft({ images: next });
  };

  const removeImage = (index: number) => {
    updateDraft({
      images: normalizeImages(draft.images).filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    });
  };

  return (
    <StepFormLayout>
      <div className="w-full">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950">
            Skapa annons
          </h1>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
          <CompactSection
            icon={<MapPin className="h-5 w-5" />}
            title="Grunddata"
          >
            <div className="grid gap-4">
              <FormField label="Titel" required>
                <Input
                  className={polishedInputClassName}
                  placeholder="Ex: 3:a nära Chalmers"
                  value={draft.title}
                  onChange={(event) => updateDraft({ title: event.target.value })}
                />
              </FormField>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField label="Stad" required>
                  <Input
                    className={polishedInputClassName}
                    placeholder="Göteborg"
                    value={draft.city}
                    onChange={(event) => updateDraft({ city: event.target.value })}
                  />
                </FormField>

                <FormField label="Område">
                  <Input
                    className={polishedInputClassName}
                    placeholder="Johanneberg"
                    value={draft.area}
                    onChange={(event) => updateDraft({ area: event.target.value })}
                  />
                </FormField>

                <FormField label="Adress" required>
                  <Input
                    className={polishedInputClassName}
                    placeholder="Gibraltargatan 82"
                    value={draft.address}
                    onChange={(event) =>
                      updateDraft({ address: event.target.value })
                    }
                  />
                </FormField>
              </div>
            </div>
          </CompactSection>

          <div className="border-t border-gray-100" />

          <CompactSection
            icon={<Home className="h-5 w-5" />}
            title="Bostad"
          >
            <div className="grid gap-4 md:grid-cols-4">
              <FormField label="Boendetyp" required>
                <Select
                  value={draft.dwellingType}
                  onValueChange={(value) =>
                    updateDraft({ dwellingType: value as PortalDwellingType })
                  }
                >
                  <SelectTrigger className={`w-full ${polishedInputClassName}`}>
                    <SelectValue placeholder="Välj boendetyp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APARTMENT">Lägenhet</SelectItem>
                    <SelectItem value="ROOM">Rum</SelectItem>
                    <SelectItem value="CORRIDOR_ROOM">Korridorsrum</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Antal rum" required>
                <NumberInput
                  min="0"
                  placeholder="1.5"
                  step="0.5"
                  value={draft.rooms}
                  onChange={(rooms) => updateDraft({ rooms })}
                />
              </FormField>

              <FormField label="Storlek" required>
                <NumberInput
                  min="0"
                  placeholder="42"
                  step="0.1"
                  suffix="m²"
                  value={draft.sizeM2}
                  onChange={(sizeM2) => updateDraft({ sizeM2 })}
                />
              </FormField>

              <FormField label="Hyra" required>
                <NumberInput
                  min="0"
                  placeholder="6200"
                  step="1"
                  suffix="kr"
                  value={draft.rent}
                  onChange={(rent) => updateDraft({ rent })}
                />
              </FormField>
            </div>
          </CompactSection>

          <div className="border-t border-gray-100" />

          <CompactSection
            icon={<CalendarDays className="h-5 w-5" />}
            title="Datum"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <FormField label="Sista ansökningsdag">
                <Input
                  className={polishedInputClassName}
                  type="date"
                  value={draft.applyBy}
                  onChange={(event) => updateDraft({ applyBy: event.target.value })}
                />
              </FormField>

              <FormField label="Tillgänglig från">
                <Input
                  className={polishedInputClassName}
                  type="date"
                  value={draft.availableFrom}
                  onChange={(event) =>
                    updateDraft({ availableFrom: event.target.value })
                  }
                />
              </FormField>

              <FormField label="Tillgänglig till">
                <Input
                  className={polishedInputClassName}
                  type="date"
                  value={draft.availableTo}
                  onChange={(event) =>
                    updateDraft({ availableTo: event.target.value })
                  }
                />
              </FormField>
            </div>
          </CompactSection>

          <div className="border-t border-gray-100" />

          <CompactSection
            icon={<Tags className="h-5 w-5" />}
            title="Innehåll"
          >
            <div className="grid gap-5">
              <FormField label="Beskrivning" required>
                <TextAreaField
                  className={polishedTextareaClassName}
                  rows={6}
                  placeholder="Beskriv bostaden, läget, villkor och vad som ingår."
                  value={draft.description}
                  onChange={(event) =>
                    updateDraft({ description: event.target.value })
                  }
                />
              </FormField>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {tagOptions.map((option) => (
                  <MultiSelectCard
                    key={option.id}
                    id={option.id}
                    checked={draft.tags.includes(option.id)}
                    onCheckedChange={() => toggleTag(option.id)}
                    className="min-h-12 rounded-md border-gray-200 bg-gray-50/70 p-3 transition-colors hover:border-gray-300 hover:bg-white has-[[aria-checked=true]]:border-[#004225] has-[[aria-checked=true]]:bg-[#004225]/5"
                  >
                    <p className="text-sm font-medium">{option.label}</p>
                  </MultiSelectCard>
                ))}
              </div>
            </div>
          </CompactSection>

          <div className="border-t border-gray-100" />

          <CompactSection
            icon={<ImageIcon className="h-5 w-5" />}
            title="Bilder"
          >
            <div className="grid gap-3">
              {imageFields.map((imageUrl, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    className={polishedInputClassName}
                    value={imageUrl}
                    placeholder={
                      index === 0
                        ? "https://exempel.se/huvudbild.jpg"
                        : "https://exempel.se/bild.jpg"
                    }
                    onChange={(event) => updateImage(index, event.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    isDisabled={imageFields.length <= MIN_IMAGE_FIELDS}
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                className="w-fit"
                type="button"
                variant="outline"
                onClick={() => updateDraft({ images: [...imageFields, ""] })}
              >
                <Plus className="h-4 w-4" />
                Lägg till bild
              </Button>
            </div>
          </CompactSection>
        </div>
      </div>
    </StepFormLayout>
  );
}
