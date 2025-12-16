"use client";

import { Button } from "@/components/ui/button";
import { PencilLine } from "lucide-react";

type Props = {
  editHref?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  messageHref?: string;
  messageLabel?: string;
  primaryLabel?: string;
};

export default function ProfileHeroActions({
  editHref,
  secondaryHref,
  secondaryLabel,
  messageHref,
  messageLabel,
  primaryLabel = "Uppdatera profil",
}: Props) {
  return (
    <div className="flex w-full items-center justify-end gap-3 overflow-hidden">
      {secondaryHref && (
        <Button
          as="a"
          href={secondaryHref}
          size="sm"
          variant="secondary"
        >
          <span className="truncate">{secondaryLabel ?? "Visa mer"}</span>
        </Button>
      )}

      {messageHref && (
        <Button
          as="a"
          href={messageHref}
          size="sm"
          variant="outline"
        >
          <span className="truncate">{messageLabel ?? "Kontakta"}</span>
        </Button>
      )}

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
        <span className="truncate">{primaryLabel}</span>
      </Button>
    </div>
  );
}
