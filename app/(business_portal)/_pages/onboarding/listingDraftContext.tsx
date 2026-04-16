"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PublishListingRequest } from "@/types/listing";

const STORAGE_KEY = "campuslyan.portal.newListingDraft.v1";

export type PortalDwellingType = "APARTMENT" | "ROOM" | "CORRIDOR_ROOM";

export type ListingDraft = {
  address: string;
  search: string;
  street: string;
  streetNumber: string;
  postalCode: string;
  city: string;
  area: string;
  apartmentNumber: string;
  country: string;
  floor: string;
  floorsInBuilding: string;
  rentalMode: string;
  furnishing: string;
  objectType: string;
  legalType: string;
  dwellingType: PortalDwellingType;
  sizeM2: string;
  rooms: string;
  bedrooms: string;
  applyBy: string;
  availabilityMode: "soonest_possible" | "choose_date" | "";
  availableFrom: string;
  availabilityEndMode: "until_further_notice" | "choose_date" | "";
  availableTo: string;
  tags: string[];
  images: string[];
  title: string;
  description: string;
  rent: string;
  includedInRent: string[];
};

type ListingDraftContextValue = {
  draft: ListingDraft;
  updateDraft: (patch: Partial<ListingDraft>) => void;
  resetDraft: () => void;
};

const defaultDraft: ListingDraft = {
  address: "",
  search: "",
  street: "",
  streetNumber: "",
  postalCode: "",
  city: "",
  area: "",
  apartmentNumber: "",
  country: "Sverige",
  floor: "",
  floorsInBuilding: "",
  rentalMode: "",
  furnishing: "",
  objectType: "",
  legalType: "",
  dwellingType: "APARTMENT",
  sizeM2: "",
  rooms: "",
  bedrooms: "",
  applyBy: "",
  availabilityMode: "",
  availableFrom: "",
  availabilityEndMode: "",
  availableTo: "",
  tags: [],
  images: [],
  title: "",
  description: "",
  rent: "",
  includedInRent: [],
};

const ListingDraftContext = createContext<ListingDraftContextValue | undefined>(
  undefined,
);

function readStoredDraft(): ListingDraft {
  if (typeof window === "undefined") return defaultDraft;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultDraft;

    const parsed = JSON.parse(stored) as Partial<ListingDraft>;
    return {
      ...defaultDraft,
      ...parsed,
      tags: Array.isArray(parsed.tags) ? parsed.tags : defaultDraft.tags,
      images: Array.isArray(parsed.images) && parsed.images.length > 0
        ? parsed.images
        : defaultDraft.images,
      includedInRent: Array.isArray(parsed.includedInRent)
        ? parsed.includedInRent
        : defaultDraft.includedInRent,
    };
  } catch {
    return defaultDraft;
  }
}

export function ListingDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<ListingDraft>(defaultDraft);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setDraft(readStoredDraft());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, isHydrated]);

  const updateDraft = useCallback((patch: Partial<ListingDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(defaultDraft);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo(
    () => ({ draft, updateDraft, resetDraft }),
    [draft, resetDraft, updateDraft],
  );

  return (
    <ListingDraftContext.Provider value={value}>
      {children}
    </ListingDraftContext.Provider>
  );
}

export function useListingDraft() {
  const context = useContext(ListingDraftContext);
  if (!context) {
    throw new Error("useListingDraft must be used within ListingDraftProvider");
  }
  return context;
}

export function getListingAddress(draft: ListingDraft) {
  if (draft.address.trim()) return draft.address.trim();

  const streetLine = [draft.street, draft.streetNumber]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");

  return streetLine || draft.search.trim();
}

function parseNumber(value: string): number | undefined {
  const normalized = value.replace(",", ".").trim();
  if (!normalized) return undefined;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function validateListingDraft(draft: ListingDraft): string[] {
  const missing: string[] = [];

  if (!draft.title.trim()) missing.push("Titel");
  if (!draft.city.trim()) missing.push("Stad");
  if (!getListingAddress(draft)) missing.push("Adress");
  if (!parseNumber(draft.rooms)) missing.push("Antal rum");
  if (!parseNumber(draft.sizeM2)) missing.push("Storlek");
  if (!parseNumber(draft.rent)) missing.push("Hyra");
  if (!draft.description.trim()) missing.push("Beskrivning");

  return missing;
}

export function buildPublishListingRequest(
  draft: ListingDraft,
): PublishListingRequest {
  const address = getListingAddress(draft);
  const area = draft.area.trim() || draft.postalCode.trim();
  const images = draft.images
    .map((image) => image.trim())
    .filter(Boolean);

  const tags = Array.from(new Set([...draft.tags, ...draft.includedInRent]));

  return {
    title: draft.title.trim(),
    city: draft.city.trim(),
    area: area || undefined,
    address,
    dwellingType: draft.dwellingType,
    rooms: parseNumber(draft.rooms),
    sizeM2: parseNumber(draft.sizeM2),
    rent: parseNumber(draft.rent),
    description: draft.description.trim(),
    tags,
    images: images.length > 0 ? images : defaultDraft.images,
    applyBy: draft.applyBy || undefined,
    availableFrom: draft.availableFrom || undefined,
    availableTo: draft.availableTo || undefined,
  };
}
