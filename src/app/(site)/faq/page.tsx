import FAQ from "@/components/shadcn-studio/blocks/faq-component-01/faq-component-01";
import { getRequestLocale } from "@/i18n/server";
import { localizedText } from "@/i18n/text";

export const dynamic = "force-dynamic";

const getFaqItems = (locale: "sv" | "en") => [
  {
    question: localizedText(locale, "Är CampusLyan gratis?", "Is CampusLyan free?"),
    answer: localizedText(locale, "Ja, plattformen är helt gratis för studenter. Inga dolda avgifter.", "Yes, the platform is completely free for students. No hidden fees."),
  },
  {
    question: localizedText(locale, "Hur väljer jag skola?", "How do I choose a school?"),
    answer: localizedText(locale, "Logga in och välj skola på startsidan. Valet sparas i din profil.", "Log in and choose your school on the homepage. The choice is saved to your profile."),
  },
  {
    question: localizedText(locale, "Hur fungerar köer?", "How do queues work?"),
    answer: localizedText(locale, "Du kan gå med i köer för företag nära din skola eller alla företag på plattformen.", "You can join queues for companies near your school or all companies on the platform."),
  },
  {
    question: localizedText(locale, "Hur skickar jag intresse?", "How do I send interest?"),
    answer: localizedText(locale, "Öppna en annons när du är inloggad och klicka på Intresseanmälan.", "Open a listing while logged in and click the interest application button."),
  },
  {
    question: localizedText(locale, "Varifrån kommer annonserna?", "Where do the listings come from?"),
    answer: localizedText(locale, "Från samarbetande studentbostadsföretag och via öppna källor med verifiering.", "From partner student housing companies and verified open sources."),
  },
  {
    question: localizedText(locale, "Vilka städer täcker ni?", "Which cities do you cover?"),
    answer: localizedText(locale, "Vi fokuserar på större studentstäder; utbudet växer löpande.", "We focus on major student cities, and the supply grows continuously."),
  },
];

export default async function FaqPage() {
  const locale = await getRequestLocale();

  return (
    <FAQ
      faqItems={getFaqItems(locale)}
      title={localizedText(locale, "Behöver du hjälp? Vi har svaren", "Need help? We have answers")}
      description={localizedText(locale, "Här hittar du svar på de vanligaste frågorna och all information du behöver.", "Here you will find answers to the most common questions and the information you need.")}
    />
  );
}
