"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import { PencilLine } from "lucide-react";

type Props = {
  editHref?: string;
  onEdit?: () => void;
  secondaryHref?: string;
  secondaryLabel?: string;
  messageHref?: string;
  messageLabel?: string;
  primaryLabel?: string;
};

export default function ProfileHeroActions({
  editHref,
  onEdit,
  secondaryHref,
  secondaryLabel,
  messageHref,
  messageLabel,
  primaryLabel = "Uppdatera profil",
}: Props) {
  const { locale, localizedHref } = useI18n();

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {secondaryHref && (
        <Button as="a" href={localizedHref(secondaryHref)} size="sm" variant="secondary">
          <span className="truncate">{secondaryLabel ?? localizedText(locale, "Visa mer", "Show more")}</span>
        </Button>
      )}

      {messageHref && (
        <Button as="a" href={localizedHref(messageHref)} size="sm" variant="outline">
          <span className="truncate">{messageLabel ?? localizedText(locale, "Kontakta", "Contact")}</span>
        </Button>
      )}

      <Button
        as={editHref ? "a" : undefined}
        href={editHref ? localizedHref(editHref) : undefined}
        onPress={editHref ? undefined : onEdit}
        size="sm"
        variant="default"
      >
        <PencilLine className="h-4 w-4" />
        <span className="truncate">{primaryLabel}</span>
      </Button>
    </div>
  );
}
