import Link from "next/link";
import { Button } from "@heroui/button";

const faqs = [
  {
    q: "Är CampusLyan gratis för studenter?",
    a: "Ja, 100%. Att skapa konto, söka bostäder, bevaka köer och ta kontakt med uthyrare är helt kostnadsfritt för dig som student.",
  },
  {
    q: "Varför behöver jag logga in med BankID?",
    a: "Vi använder BankID för att verifiera att du är en riktig person. Det skapar en tryggare plattform för alla och gör att hyresvärdar prioriterar din ansökan.",
  },
  {
    q: "Hur fungerar bostadsköerna på sidan?",
    a: "Vi samlar information och lediga objekt från både kommunala och privata bolag. Vi guidar dig till var du har störst chans att få en bostad och hur du ställer dig i respektive kö.",
  },
  {
    q: "Kan jag hyra ut mitt rum om jag ska på utbyte?",
    a: "Absolut! Inom kort kan du enkelt lägga upp en annons för att hitta en annan verifierad student som vill hyra ditt rum under tiden du är borta.",
  },
  {
    q: "Hur fungerar matchningen för privatpersoner?",
    a: "Vi verifierar alla användare för att eliminera bedrägerier. Du får kontakt med seriösa studenter och vi guidar er genom processen så att uthyrningen blir trygg för båda parter.",
  },
  {
    q: "Varför ser jag inte adressen direkt?",
    a: "För att skydda både din och uthyrarens integritet visas exakt adress och kontaktuppgifter först när du är inloggad.",
  },
  {
    q: "Kan jag se restid till mitt campus?",
    a: "Ja! I kartvyn kan du filtrera bostäder baserat på hur lång tid det tar att ta sig till just din skola med cykel eller kollektivtrafik.",
  },
  {
    q: "Hjälper ni till med mer än bara boende?",
    a: "Vi vill göra hela din bostadsresa enklare. Därför samlar vi även spartips, guider för studentekonomi och checklistor inför din första flytt.",
  },
];


export default function Faq() {
  return (
    <section className="section text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="container-page">
        <h2 className="h2 mb-6 text-slate-900 dark:text-white">Vanliga frågor</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map((f, i) => (
            <article
              key={i}
              className="rounded-2xl border border-black/5 p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/80"
            >
              <div className="mb-2 font-semibold text-slate-900 dark:text-white">{f.q}</div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{f.a}</p>
            </article>
          ))}
        </div>
        {/*
        <div className="mt-6">
          <Button
            as={Link}
            href="/faq"
            color="success" variant="solid" radius="full"
            className="mt-1 w-full justify-center text-white bg-[#004225] hover:bg-[#004225]/90"
          >
            Läs fler frågor
          </Button>
        </div>
        */}
      </div>
    </section>
  );
}
