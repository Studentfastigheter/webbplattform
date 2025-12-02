"use client";

import { Button } from "@heroui/button";
import { ExternalLink, Share2, Heart } from "lucide-react";

export default function QueueHeroActions({ website }: { website?: string }) {
  return (
    <div className="flex w-full items-center gap-2 sm:gap-3 overflow-hidden">
      {/* Primär knapp – men tvingad stil */}
      <Button
        type="button"
        onPress={() => console.log("Lägg till i ansökan")}
        radius="full"
        className="
          flex-1 min-w-0 
          bg-green-900 text-white 
          font-semibold 
          rounded-full 
          px-3 py-2 sm:px-4
          text-xs sm:text-sm
          hover:bg-green-800
          h-9 sm:h-10
        "
      >
        <span className="truncate">Lägg till kö</span>
      </Button>

      {/* Sekundär knapp – exakt samma stil som innan */}
      {website && (
        <Button
          as="a"
          href={website}
          rel="noreferrer"
          target="_blank"
          radius="full"
          variant="light"
          className="
            flex-1 min-w-0
            font-semibold text-gray-800 
            rounded-full
            border border-gray-200 
            bg-white
            px-3 py-2 sm:px-4
            text-xs sm:text-sm
            hover:bg-gray-50 hover:border-gray-300
            h-9 sm:h-10
          "
        >
          <ExternalLink className="h-4 w-4" />
          <span className="truncate">Hemsida</span>
        </Button>
      )}

      {/* Ikonknappar – identiska med dina original */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <Button
          isIconOnly
          radius="full"
          variant="light"
          onPress={() => console.log("Favorit")}
          className="
            h-8 w-8 sm:h-9 sm:w-9
            rounded-full
            border border-gray-200 
            bg-white
            text-gray-600
            hover:bg-gray-50 hover:border-gray-300
          "
        >
          <Heart className="h-4 w-4" />
        </Button>

        <Button
          isIconOnly
          radius="full"
          variant="light"
          onPress={() => console.log("Dela")}
          className="
            h-8 w-8 sm:h-9 sm:w-9
            rounded-full
            border border-gray-200 
            bg-white
            text-gray-600
            hover:bg-gray-50 hover:border-gray-300
          "
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
