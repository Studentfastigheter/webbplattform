"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, Share2, Heart } from "lucide-react";

export default function QueueHeroActions({ website }: { website?: string }) {
  return (
    <div className="flex w-full items-center gap-2 sm:gap-3 overflow-hidden">
      {/* Primär knapp – men tvingad stil */}
      <Button
        type="button"
        onPress={() => console.log("Lägg till i ansökan")}
        size="sm"
        variant="default"
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
          size="sm"
          variant="ghost"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="truncate">Hemsida</span>
        </Button>
      )}

      {/* Ikonknappar – identiska med dina original */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <Button
          isIconOnly
          onPress={() => console.log("Favorit")}
          size="icon-sm"
          variant="link"
        >
          <Heart className="h-4 w-4" />
        </Button>

        <Button
          isIconOnly
          onPress={() => console.log("Dela")}
          size="icon-sm"
          variant="link"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
