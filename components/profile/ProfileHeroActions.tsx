"use client";

import { Button } from "@heroui/button";
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
        <PencilLine className="h-4 w-4" />
        <span className="truncate">Uppdatera profil</span>
      </Button>

      {secondaryHref && (
        <Button
          as="a"
          href={secondaryHref}
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
          <span className="truncate">{secondaryLabel}</span>
        </Button>
      )}

      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {messageHref && (
          <Button
            as="a"
            href={messageHref}
            isIconOnly
            radius="full"
            variant="light"
            className="
              h-8 w-8 sm:h-9 sm:w-9
              rounded-full
              border border-gray-200 
              bg-white
              text-gray-600
              hover:bg-gray-50 hover:border-gray-300
            "
          >
            <Mail className="h-4 w-4" />
          </Button>
        )}

        <Button
          isIconOnly
          radius="full"
          variant="light"
          onPress={() => console.log("Dela profil")}
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
