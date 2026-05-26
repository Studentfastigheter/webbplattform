/**
 * Dummy media data for the company detail page.
 * Keyed by company ID so different companies can have different demo content.
 * Falls back to DEFAULT_MEDIA when no entry matches.
 *
 * HAVE TO DELETE THIS AFTER BACKEND IMPLEMENTATION FOR VIDEO AND GALLERY IMAGES
 */

export interface CompanyMedia {
  /** YouTube embed URL, or null if no video should be shown */
  videoUrl: string | null;
  /** Ordered list of gallery image URLs (empty = no gallery) */
  galleryImages: string[];
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
  },
  2: {
    videoUrl: "https://www.youtube.com/embed/RBumgq5yVrA",
    galleryImages: GALLERY_B,
  },
  3: {
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    galleryImages: GALLERY_A.slice(0, 4),
  },
};

// ─── Fallback ─────────────────────────────────────────────────────────────────

const DEFAULT_MEDIA: CompanyMedia = {
  videoUrl: "https://www.youtube.com/embed/pBkHHoOIIn8",
  galleryImages: GALLERY_A,
};

// ─── Public helper ─────────────────────────────────────────────────────────────

/**
 * Returns media data for a given company ID.
 * Always returns a valid object — never null — for graceful rendering.
 */
export function getCompanyMedia(companyId: number): CompanyMedia {
  return COMPANY_MEDIA[companyId] ?? DEFAULT_MEDIA;
}
