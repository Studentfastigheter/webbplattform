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

const colorMap: Record<Status, string> = {
  Antagen: "#008000",
  Aktiv: "#008000",
  "Under granskning": "#FFD32C",
  Bearbetas: "#FFD32C",
  Erbjudande: "#2563EB",
  Nekad: "#FF3333",
  Inaktiv: "#FF3333",
};

export default function StatusTag(props: StatusTagProps) {
  const { locale } = useI18n();
  const {
    status,
    bgColorOverride,
    textColor = "#FFFFFF",
    height = 20,
    horizontalPadding = 10,
    width,
    className = "",
  } = props;

  const bgColor = bgColorOverride ?? colorMap[status];
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
      textColor={textColor}
      height={height}
      horizontalPadding={horizontalPadding}
      className={className}
      width={width}
    />
  );
}
