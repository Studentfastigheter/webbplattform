"use client";

import { Button } from "@/components/ui/button";
import { Mail, Share2, PencilLine } from "lucide-react";

type Props = {
  editHref?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  messageHref?: string;
};

export default function ProfileHeroActions({
  editHref,
  secondaryHref,
  secondaryLabel = "Mina ansökningar",
  messageHref,
}: Props) {
  return (
    <div className="flex w-full items-center gap-2 sm:gap-3 overflow-hidden">
      <Button
        as={editHref ? "a" : undefined}
        href={editHref}
        onPress={
          editHref ? undefined : () => console.log("Redigera profil")
        }
        size="sm"
        variant="default"

      >
        <PencilLine className="h-4 w-4" />
        <span className="truncate">Uppdatera profil</span>
      </Button>

      {secondaryHref && (
        <Button
          as="a"
          href={secondaryHref}
          size="sm"
          variant="ghost"
        >
          <span className="truncate">{secondaryLabel}</span>
        </Button>
      )}

      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {messageHref && (
          <Button
            as="a"
            href={messageHref}
            isIconOnly
            size="icon-sm"
            variant="link"
          >
            <Mail className="h-4 w-4" />
          </Button>
        )}

        <Button
          isIconOnly
          onPress={() => console.log("Dela profil")}
          size="icon-sm"
          variant="link"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
