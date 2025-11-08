import Link from "next/link";
import { Button } from "@heroui/button";

const faqs = [
  {
    q: "Är CampusLyan gratis?",
    a: "Ja. Plattformen är helt kostnadsfri för studenter att använda.",
  },
  {
    q: "Hur funkar köer och intresse?",
    a: "När du är inloggad kan du ställa dig i köer för företag och skicka intresse direkt från annonsen.",
  },
  {
    q: "Hur väljer jag skola?",
    a: "Välj din skola på startsidan (inloggad) så visas avstånd i km till varje annons och relevanta köer.",
  },
  {
    q: "Varför ser jag inte adressen?",
    a: "Detaljerad information som adress visas när du är inloggad.",
  },
];

export default function Faq() {
  return (
    <section className="section bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="container-page">
        <h2 className="h2 mb-6 text-slate-900 dark:text-white">Vanliga frågor</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map((f, i) => (
            <article
              key={i}
              className="rounded-2xl border border-black/5 bg-white/95 p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/80"
            >
              <div className="mb-2 font-semibold text-slate-900 dark:text-white">{f.q}</div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{f.a}</p>
            </article>
          ))}
        </div>
        <div className="mt-6">
          <Button
            as={Link}
            href="/faq"
            variant="bordered"
            color="success"
            className="border-slate-300 text-slate-900 hover:bg-white/60 dark:border-white/40 dark:text-white"
          >
            Läs fler frågor
          </Button>
        </div>
      </div>
    </section>
  );
}
