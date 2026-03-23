import FAQ from "@/components/shadcn-studio/blocks/faq-component-01/faq-component-01";

export const dynamic = "force-static";

const faqItems = [
  {
    question: "Är CampusLyan gratis?",
    answer: "Ja, plattformen är helt gratis för studenter. Inga dolda avgifter.",
  },
  {
    question: "Hur väljer jag skola?",
    answer: "Logga in och välj skola på startsidan. Valet sparas i din profil.",
  },
  {
    question: "Hur fungerar köer?",
    answer:
      "Du kan gå med i köer för företag nära din skola eller alla företag på plattformen.",
  },
  {
    question: "Hur skickar jag intresse?",
    answer: "Öppna en annons när du är inloggad och klicka på Intresseanmälan.",
  },
  {
    question: "Varifrån kommer annonserna?",
    answer:
      "Från samarbetande studentbostadsföretag och via öppna källor med verifiering.",
  },
  {
    question: "Vilka städer täcker ni?",
    answer: "Vi fokuserar på större studentstäder; utbudet växer löpande.",
  },
];

export default function FaqPage() {
  return <FAQ faqItems={faqItems} />;
}
