"use client";

import { PartnerGrid } from "@/features/marketing/components/business/PartnerGrid";
import { TrustHero } from "@/features/marketing/components/business/PartnerHero";
import { foundingPartners, regularPartners, housingPartners } from "@/data/partners";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

export default function PartnersPage() {
  const { locale } = useI18n();
  const foundingPartnerDescriptions = [
    localizedText(
      locale,
      "Som grundande partner får ni en framträdande position på plattformen med hög synlighet mot studenter, samt möjlighet att vara med och forma hur ert erbjudande presenteras från start.",
      "As a founding partner you receive a prominent position on the platform with high visibility among students and the opportunity to help shape how your offer is presented from the start.",
    ),
    localizedText(
      locale,
      "Ni exponeras löpande i centrala delar av plattformen och associeras med lanseringen, vilket stärker ert varumärke i en relevant och attraktiv målgrupp.",
      "You are shown continuously in central parts of the platform and associated with the launch, strengthening your brand in a relevant and attractive audience.",
    ),
    localizedText(
      locale,
      "Partnerskapet ger er prioriterad synlighet, tidig närvaro i ekosystemet och möjligheten att bygga relationer med studenter redan från plattformens uppstart.",
      "The partnership gives you prioritized visibility, early presence in the ecosystem and the opportunity to build relationships with students from the platform's launch.",
    ),
  ];
  const localizedFoundingPartners = foundingPartners.map((partner, index) => ({
    ...partner,
    name: localizedText(locale, "Grundande partner", "Founding partner"),
    category: localizedText(locale, "Grundande partner", "Founding partner"),
    description: foundingPartnerDescriptions[index] ?? partner.description,
  }));
  const localizedRegularPartners = regularPartners.map((partner) => ({
    ...partner,
    category: localizedText(locale, partner.category, partner.category),
  }));
  const localizedHousingPartners = housingPartners.map((partner) => ({
    ...partner,
    category: localizedText(locale, "Bostadsföretag", "Housing company"),
    description:
      partner.name === "SGS Studentbostäder"
        ? localizedText(
            locale,
            "En av Sveriges största studentbostadsstiftelser som erbjuder trygga hem för tusentals studenter i Göteborg.",
            "One of Sweden's largest student housing foundations, offering secure homes for thousands of students in Gothenburg.",
          )
        : partner.name === "Guldhedens Studiehem"
          ? localizedText(
              locale,
              "Guldhedens Studiehem är beläget i centrala Guldheden med gångavstånd till både Chalmers, Göteborgs Universitet och centrum.",
              "Guldhedens Studiehem is located in central Guldheden within walking distance of Chalmers, the University of Gothenburg and the city center.",
            )
          : partner.description,
  }));

  return (
    <main className="main-marketing-theme min-h-screen bg-background text-foreground">
      <TrustHero />

      {foundingPartners.length > 0 && (
        <PartnerGrid
          title={localizedText(locale, "Bli en grundande partner", "Become a founding partner")}
          description={localizedText(
            locale,
            "Våra grundande partners är en utvald grupp aktörer som varit med från start och format CampusLyan till vad det är idag. De representerar nytänkande och ligger i framkant inom utvecklingen av studentbostäder i Sverige.",
            "Our founding partners are a selected group of organizations that have been involved from the start and shaped CampusLyan. They represent new thinking and are at the forefront of student housing development in Sweden.",
          )}
          subDescription={localizedText(
            locale,
            "Som grundande partner får ni prioriterad exponering mot studenter genom välkomstbrev, partnersida och sociala kanaler. Ni får även ett strategiskt inflytande över plattformens utveckling och är med och formar framtidens mötesplats för studentbostäder.",
            "As a founding partner, you get prioritized exposure to students through welcome emails, the partner page and social channels. You also gain strategic influence over the platform's development and help shape the future meeting place for student housing.",
          )}
          partners={localizedFoundingPartners}
          columns={3}
          variant="founding"
        />
      )}

      {regularPartners.length > 0 && (
        <PartnerGrid
          title={localizedText(locale, "Partners", "Partners")}
          description={localizedText(
            locale,
            "Våra partners är en noggrant utvald grupp aktörer som aktivt stöttar nya initiativ och för utvecklingen av studentbostäder framåt. De drivs av en tydlig ambition att ligga i framkant och utveckla moderna lösningar för framtidens studentboende.",
            "Our partners are a carefully selected group of organizations that actively support new initiatives and move student housing forward. They share a clear ambition to stay ahead and develop modern solutions for the future of student housing.",
          )}
          partners={localizedRegularPartners}
          columns={3}
        />
      )}

      <PartnerGrid
        title={localizedText(locale, "Bostadsföretag", "Housing companies")}
        description={localizedText(
          locale,
          "Våra bostadsföretag omfattar etablerade aktörer från hela Sverige som tillsammans erbjuder ett brett utbud av studentbostäder. De representerar stabilitet, kvalitet och erfarenhet, och utgör en viktig del av studenters väg till ett tryggt boende.",
          "Our housing companies include established providers across Sweden that together offer a broad range of student housing. They represent stability, quality and experience, and are an important part of students' path to a secure home.",
        )}
        partners={localizedHousingPartners}
        columns={4}
      />

    </main>
  );
}
