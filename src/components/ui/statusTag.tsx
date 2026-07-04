"use client";

import Tag from "./Tag";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

export type Status =
  | "Antagen"
  | "Under granskning"
  | "Nekad"
  | "Aktiv"
  | "Inaktiv"
  | "Bearbetas"
  | "Erbjudande";

type StatusTagProps = {
  status: Status;
  bgColorOverride?: string;
  textColor?: string;
  height?: number;
  horizontalPadding?: number;
  width?: number | string;
  className?: string;
};

// Mjuka chips (tonad bakgrund + mörk text) i stället för råa webbfärger —
// samma familj som övriga statusytor (emerald/amber/red-50) och godkänd
// kontrast (gult med vit text klarade inte WCAG).
const colorMap: Record<Status, { bg: string; text: string }> = {
  Antagen: { bg: "#ecfdf5", text: "#047857" },
  Aktiv: { bg: "#ecfdf5", text: "#047857" },
  "Under granskning": { bg: "#fffbeb", text: "#b45309" },
  Bearbetas: { bg: "#fffbeb", text: "#b45309" },
  Erbjudande: { bg: "#eff6ff", text: "#1d4ed8" },
  Nekad: { bg: "#fef2f2", text: "#b91c1c" },
  Inaktiv: { bg: "#f3f4f6", text: "#4b5563" },
};

export default function StatusTag(props: StatusTagProps) {
  const { locale } = useI18n();
  const {
    status,
    bgColorOverride,
    textColor,
    height = 20,
    horizontalPadding = 10,
    width,
    className = "",
  } = props;

  const colors = colorMap[status];
  const bgColor = bgColorOverride ?? colors.bg;
  const resolvedTextColor = textColor ?? colors.text;
  const displayText: Record<Status, string> = {
    Antagen: localizedText(locale, "Antagen", "Accepted"),
    Aktiv: localizedText(locale, "Aktiv", "Active"),
    "Under granskning": localizedText(locale, "Under granskning", "Under review"),
    Bearbetas: localizedText(locale, "Bearbetas", "Processing"),
    Erbjudande: localizedText(locale, "Erbjudande", "Offer"),
    Nekad: localizedText(locale, "Nekad", "Rejected"),
    Inaktiv: localizedText(locale, "Inaktiv", "Inactive"),
  };

  return (
    <Tag
      text={displayText[status] ?? status}
      bgColor={bgColor}
      textColor={resolvedTextColor}
      height={height}
      horizontalPadding={horizontalPadding}
      className={className}
      width={width}
    />
  );
}
