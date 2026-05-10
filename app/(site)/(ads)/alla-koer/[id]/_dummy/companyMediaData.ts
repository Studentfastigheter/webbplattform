/**
 * Dummy media data for the company detail page.
 * Keyed by company ID so different companies can have different demo content.
 * Falls back to DEFAULT_MEDIA when no entry matches.
 *
 * HAVE TO DELETE THIS AFTER BACKEND IMPLEMENTATION FOR VIDEO AND GALLERY IMAGES
 */

export interface CompanyMapListing {
  id: string;
  title: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  rent: number;
  rooms: number;
  /** Optional preview image — used by the map popup card */
  imageUrl?: string;
}

export interface CompanyMedia {
  /** YouTube embed URL, or null if no video should be shown */
  videoUrl: string | null;
  /** Ordered list of gallery image URLs (empty = no gallery) */
  galleryImages: string[];
  /** Listings with coordinates for the map section */
  mapListings: CompanyMapListing[];
}

// ─── Shared pool of images ────────────────────────────────────────────────────

const GALLERY_A: string[] = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
];

const GALLERY_B: string[] = [
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
  "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&q=80",
];

// ─── Per-company overrides ─────────────────────────────────────────────────────

const COMPANY_MEDIA: Record<number, CompanyMedia> = {
  1: {
    videoUrl: "https://www.youtube.com/embed/pBkHHoOIIn8",
    galleryImages: GALLERY_A,
    mapListings: [
      { id: "l1", title: "Studentrum Centrum", city: "Göteborg", address: "Avenyn 12", lat: 57.6989, lng: 11.9746, rent: 4200, rooms: 1, imageUrl: GALLERY_A[0] },
      { id: "l2", title: "2-roa Majorna", city: "Göteborg", address: "Stigbergsliden 3", lat: 57.6956, lng: 11.9348, rent: 7800, rooms: 2, imageUrl: GALLERY_A[1] },
      { id: "l3", title: "Liten etta Linnéstaden", city: "Göteborg", address: "Linnégatan 55", lat: 57.6994, lng: 11.9447, rent: 6500, rooms: 1, imageUrl: GALLERY_A[2] },
      { id: "l4", title: "Studentbostad Hisingen", city: "Göteborg", address: "Vågmästaregatan 7", lat: 57.7189, lng: 11.9323, rent: 3900, rooms: 1, imageUrl: GALLERY_A[3] },
    ],
  },
  2: {
    videoUrl: "https://www.youtube.com/embed/RBumgq5yVrA",
    galleryImages: GALLERY_B,
    mapListings: [
      { id: "l5", title: "Modern etta Södermalm", city: "Stockholm", address: "Hornsgatan 22", lat: 59.3181, lng: 18.0620, rent: 9500, rooms: 1, imageUrl: GALLERY_B[0] },
      { id: "l6", title: "2-roa Östermalm", city: "Stockholm", address: "Karlavägen 40", lat: 59.3394, lng: 18.0810, rent: 14000, rooms: 2, imageUrl: GALLERY_B[1] },
      { id: "l7", title: "Studentrum Kungsholmen", city: "Stockholm", address: "Hantverkargatan 14", lat: 59.3305, lng: 18.0344, rent: 7200, rooms: 1, imageUrl: GALLERY_B[2] },
    ],
  },
  3: {
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    galleryImages: GALLERY_A.slice(0, 4),
    mapListings: [
      { id: "l8", title: "Studentlägenhet Lund C", city: "Lund", address: "Sölvegatan 10", lat: 55.7101, lng: 13.2013, rent: 5100, rooms: 1, imageUrl: GALLERY_A[0] },
      { id: "l9", title: "Rum med kök Klostergården", city: "Lund", address: "Klosterängsvägen 3", lat: 55.7015, lng: 13.1879, rent: 4600, rooms: 1, imageUrl: GALLERY_A[1] },
    ],
  },
};

// ─── Fallback ─────────────────────────────────────────────────────────────────

const DEFAULT_MEDIA: CompanyMedia = {
  videoUrl: "https://www.youtube.com/embed/pBkHHoOIIn8",
  galleryImages: GALLERY_A,
  mapListings: [
    { id: "d1", title: "Studentrum Centrum", city: "Göteborg", address: "Avenyn 12", lat: 57.6989, lng: 11.9746, rent: 4500, rooms: 1, imageUrl: GALLERY_A[0] },
    { id: "d2", title: "2-roa Majorna",      city: "Göteborg", address: "Stigbergsliden 3", lat: 57.6956, lng: 11.9348, rent: 7800, rooms: 2, imageUrl: GALLERY_A[1] },
    { id: "d3", title: "Etta Linné",         city: "Göteborg", address: "Linnégatan 55",  lat: 57.6994, lng: 11.9447, rent: 6200, rooms: 1, imageUrl: GALLERY_A[2] },
    { id: "d4", title: "Etta Vasastan",      city: "Stockholm", address: "Vasagatan 10",   lat: 59.3346, lng: 18.0601, rent: 8900, rooms: 1, imageUrl: GALLERY_A[3] },
  ],
};

// ─── Public helper ─────────────────────────────────────────────────────────────

/**
 * Returns media data for a given company ID.
 * Always returns a valid object — never null — for graceful rendering.
 */
export function getCompanyMedia(companyId: number): CompanyMedia {
  return COMPANY_MEDIA[companyId] ?? DEFAULT_MEDIA;
}
