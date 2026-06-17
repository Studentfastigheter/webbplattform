 "use client";

import Tag from "./Tag";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

export default function VerifiedTag() {
  const { locale } = useI18n();

  return (
    <Tag
      text={localizedText(locale, "Verifierat bostadsbolag", "Verified housing company")}
      textColor="#FFFFFF"
      bgColor="#0F4D0F"
      className="inline-flex items-center"
      height={16}
      horizontalPadding={8}
      fontSize={10}
      lineHeight={12}
    />
  );
}
