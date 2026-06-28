import type { Locale } from "@/i18n/config";
import { localizedText } from "@/i18n/text";

export type BusinessTestimonial = {
  quote: string;
  authorName: string;
  title: string;
  companyName: string;
  portraitSrc: string;
  portraitAlt: string;
  companyLogoSrc?: string;
  companyLogoAlt?: string;
};

export function getBusinessTestimonials(locale: Locale): BusinessTestimonial[] {
  return [
    {
      quote: localizedText(
        locale,
        "Genom CampusLyan kan vi nå fler studenter och spara tid internt. Integrationen mot Hogia DinHyresvärd gör att vårt bostadsbestånd hämtas in automatiskt, vilket effektiviserar arbetet och stärker vår synlighet mot studenter.",
        "Through CampusLyan, we can reach more students and save time internally. The integration with Hogia DinHyresvärd means our housing portfolio is imported automatically, which streamlines our work and strengthens our visibility among students.",
      ),
      authorName: "Ingunn Mack Løvdal",
      title: localizedText(locale, "VD", "CEO"),
      companyName: "Wikowia",
      portraitSrc: "/testimonials/ingunn_lovdal.png",
      portraitAlt: "Ingunn Mack Løvdal",
      companyLogoSrc: "/partners/Wikowia.svg",
      companyLogoAlt: localizedText(locale, "Wikowia logotyp", "Wikowia logo"),
    },
    {
      quote: localizedText(
        locale,
        "CampusLyan ger oss synlighet mot studenter i hela Sverige och förenklar uthyrningsprocessen genom att automatiskt hantera annonser och ansökningar direkt i vårt fastighetssystem.",
        "CampusLyan gives us visibility among students across Sweden and simplifies the rental process by automatically handling listings and applications directly in our property system.",
      ),
      authorName: "Victoria Lenander",
      title: localizedText(locale, "Försäljnings- och marknadschef", "Sales and Marketing Manager"),
      companyName: "SBS Studentbostäder",
      portraitSrc: "/testimonials/Victoria_Lenander.png",
      portraitAlt: "Victoria Lenander",
      companyLogoSrc: "/partners/SBSStudentbostäder.svg",
      companyLogoAlt: localizedText(locale, "SBS Studentbostäder logotyp", "SBS Studentbostäder logo"),
    },
    {
      quote: localizedText(
        locale,
        "CampusLyan är ett mycket efterfrågat initiativ som har potential att stärka studenters möjligheter att hitta boende i hela Sverige. Jag ser med stor förväntan på den fortsatta utvecklingen av plattformen och vilka värden den kan skapa för både studenter och bostadsaktörer!",
        "CampusLyan is a highly requested initiative with the potential to strengthen students' ability to find housing across Sweden. I look forward to the continued development of the platform and the value it can create for both students and housing providers!",
      ),
      authorName: "Gabriella Näslund",
      title: localizedText(locale, "Vice ordförande", "Vice Chair"),
      companyName: "SGS Studentbostäder",
      portraitSrc: "/testimonials/Gabriella_Naslund.jpg",
      portraitAlt: "Gabriella Näslund",
      companyLogoSrc: "/partners/SGSStudentbostäder.svg",
      companyLogoAlt: localizedText(locale, "SGS Studentbostäder logotyp", "SGS Studentbostäder logo"),
    },
    {
      quote: localizedText(
        locale,
        "Vi ser CampusLyan som ett värdefullt initiativ för Göteborgs studenter. Genom att stödja arbetet vill vi bidra till att fler studenter får en enklare och tydligare väg till boende.",
        "We see CampusLyan as a valuable initiative for Gothenburg's students. By supporting the work, we want to help more students get an easier and clearer path to housing.",
      ),
      authorName: "Nils Geeraedts",
      title: localizedText(locale, "Ordförande", "Chair"),
      companyName: "Göteborgs förenade studentkårer",
      portraitSrc: "/testimonials/nils.png",
      portraitAlt: "Nils Geeraedts",
      companyLogoSrc: "/partners/GFS.svg",
      companyLogoAlt: localizedText(locale, "Göteborgs förenade studentkårer logotyp", "Gothenburg's united student unions logo"),
    },
    {
      quote: localizedText(
        locale,
        "Ett tryggt studentboende är en av grundstenarna för en lyckad studietid, därför var Campuslyan ett självklart val för oss. Campuslyan samlar seriösa aktörer och hjälper studenten hitta hem!",
        "Safe student housing is one of the foundations of a successful study period, which made Campuslyan an obvious choice for us. Campuslyan brings together serious actors and helps students find a home!",
      ),
      authorName: "Frida Karlsson Blandlund",
      title: localizedText(locale, "VD", "CEO"),
      companyName: "Campus Roslagen",
      portraitSrc: "/testimonials/frida_karlsson.jpg",
      portraitAlt: "Frida Karlsson Blandlund",
      companyLogoSrc: "/partners/CampusRoslagen.svg",
      companyLogoAlt: localizedText(locale, "Campus Roslagen logotyp", "Campus Roslagen logo"),
    },
  ];
}
