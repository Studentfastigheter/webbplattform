"use client";

import { Button } from "@/components/ui/button";
import { Mail, Share2, PencilLine } from "lucide-react";

type Props = {
  editHref?: string;
};

export default function ProfileHeroActions({ editHref }: Props) {
  return (
    <div className="flex w-full items-center justify-end gap-3 overflow-hidden">
      <Button
        as={editHref ? "a" : undefined}
        href={editHref}
        onPress={editHref ? undefined : () => console.log("Redigera profil")}
        radius="full"
        className="
          min-w-0 
          bg-green-900 text-white 
          font-semibold 
          rounded-full 
          px-4
          text-sm
          hover:bg-green-800
          h-10
        "
      >
        <PencilLine className="h-4 w-4" />
        <span className="truncate">Uppdatera profil</span>
      </Button>
    </div>
  );
}