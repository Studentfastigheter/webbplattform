"use client";

import { ExternalLink, Share2, Heart } from "lucide-react";

export default function QueueHeroActions({ website }: { website?: string }) {
  return (
    <div className="flex w-full items-center gap-2 sm:gap-3">
      {/* Lägg till i ansökan – primär */}
      <button
        type="button"
        onClick={() => console.log("Lägg till i ansökan")}
        className="inline-flex flex-1 min-w-0 items-center justify-center gap-2 rounded-full bg-green-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-800 sm:px-4 sm:text-sm"
      >
        <span className="truncate">Lägg till kö</span>
      </button>

      {/* Hyresvärdens hemsida – sekundär */}
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 min-w-0 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 transition hover:border-gray-300 hover:bg-gray-50 sm:px-4 sm:text-sm"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="truncate">Hemsida</span>
        </a>
      )}

      {/* Ikonknappar – fast bredd, alltid på samma rad */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Favorit */}
        <button
          type="button"
          onClick={() => console.log("Favorit klickad")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 sm:h-9 sm:w-9"
          aria-label="Favoritisera kön"
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Dela */}
        <button
          type="button"
          onClick={() => console.log("Dela klickad")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 sm:h-9 sm:w-9"
          aria-label="Dela bostadskön"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
