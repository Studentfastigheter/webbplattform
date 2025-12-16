"use client";

import { Button } from "@/components/ui/button";
import { PencilLine } from "lucide-react";

type Props = {
  editHref?: string;
};

export default function ProfileHeroActions({ editHref }: Props) {
  return (
    <div className="flex w-full items-center justify-end gap-3 overflow-hidden">
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
    </div>
  );
}