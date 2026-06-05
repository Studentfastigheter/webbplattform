"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

const featuredLogos = [
  {
    name: "SBS Studentbostäder",
    src: "/partners/SBSStudentbostäder.svg",
  },
  {
    name: "Wikowia",
    src: "/partners/Wikowia.svg",
  },
  {
    name: "Campus Roslagen",
    src: "/partners/CampusRoslagen.svg",
  },
];

export const TrustHero = () => {
  const { locale } = useI18n();

  return (
    <section className="border-b border-border bg-background px-6 py-24 md:py-32">
      <div className="mx-auto flex max-w-7xl flex-col items-center text-center">
        <p className="mb-5 text-xs font-semibold uppercase text-muted-foreground">
          {localizedText(locale, "CampusLyan partners", "CampusLyan partners")}
        </p>
        <h1 className="max-w-4xl text-5xl font-bold text-foreground md:text-7xl">
          {localizedText(locale, "Tillsammans med Sveriges bostadsaktörer", "Together with Sweden's housing providers")}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {localizedText(
            locale,
            "Våra partners samlar studentbostäder, lokal närvaro och erfarenhet på en plats.",
            "Our partners bring student housing, local presence and experience together in one place.",
          )}
        </p>
      </div>
    </section>
  );
};
