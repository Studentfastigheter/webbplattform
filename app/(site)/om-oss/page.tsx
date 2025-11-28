import {Compass, ShieldCheck } from "lucide-react";

export const dynamic = "force-static";

type Highlight = { label: string; value: string };
type ValueCard = { title: string; description: string };
type ContactLink = { label: string; href: string };

const STATS: Highlight[] = [
  { label: "Lansering", value: "2026" },
  { label: "Publicerade bostäder", value: "0" },
  { label: "Studenter registrerade", value: "0" },
];

const VALUE_CARDS: ValueCard[] = [
  {
    title: "Trygga och verifierade studentbostäder",
    description:
      "Vi kvalitetssäkrar annonser och profiler. Följ dina ködagar i realtid, bevaka favoriter och hitta din nästa lya – utan avgifter.",
  },
  {
    title: "Smart karta för studentlivet",
    description:
      "Se avstånd till ditt campus, pendlingstid, kollektivtrafik och närservice i en och samma vy. Boende i rätt läge, från dag ett.",
  },
  {
    title: "Sömlösa verktyg för hyresvärdar",
    description:
      "Publicera bostäder, ta emot intresseanmälningar och välj rätt student snabbare. Allt skött direkt i CampusLyan.",
  },
  {
    title: "Integritet i första rummet",
    description:
      "Vi skyddar dina uppgifter och följer GDPR. Läs mer om hur vi arbetar med säker datadelning under Integritet och Dataskydd.",
  },
];

const CONTACT_LINKS: ContactLink[] = [
  { label: "Kundservice & kontakt", href: "/kundservice" },
  { label: "Integritet & dataskydd", href: "/privacy" },
  { label: "Partners & samarbeten", href: "/partners" },
];

function SectionHeading({ title, eyebrow, description }: { title: string; eyebrow?: string; description?: string }) {
  return (
    <header className="space-y-3 mb-8">
      {eyebrow && <p className="eyebrow text-brand">{eyebrow}</p>}
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      {description && <p className="text-slate-900 max-w-2xl">{description}</p>}
    </header>
  );
}

function MetricCard({ label, value }: Highlight) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/80 px-4 py-6 text-center shadow-sm">
      <p className="text-3xl font-bold text-brand">{value}</p>
      <p className="text-sm text-slate-900">{label}</p>
    </div>
  );
}

export default function OmPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b ">
      <section className="section">
        <div className="container-page space-y-8 py-10 md:py-14">
          <div className="max-w-3xl space-y-4">
            <p className="eyebrow text-brand">Teamet bakom CampusLyan</p>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Byggt av studenter – för studenter</h1>
            <p className="text-base md:text-lg text-slate-900">
              Vi som ligger bakom CampusLyan är studenter på Chalmers tekniska högskola. Vi bygger en gratis och trygg plattform som samlar studentbostäder, köinformation och smarta verktyg – så att det blir enklare för studenter att hitta hem och för värdar att nå rätt hyresgäst.
            </p>
          </div>

          <div className="grid gap-4 text-center sm:grid-cols-3">
            {STATS.map((stat) => (
              <MetricCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </section>

      

      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow="Vad vi gör"
            title="Från bostadsbevakningar till partnerplattform"
            description="CampusLyan är både en guide för studenter och ett nav för studentbostadsföretag. Här är några av värdena du får hos oss – gratis och tryggt från start."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {VALUE_CARDS.map((value) => (
              <article key={value.title} className="rounded-2xl p-5 shadow-sm">
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-slate-900 leading-relaxed">{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-3xl bg-white/90 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Compass className="h-10 w-10 rounded-full bg-brand/10 p-2 text-brand" />
                <div>
                  <p className="text-sm uppercase tracking-wide text-brand">Vårt löfte</p>
                  <h3 className="text-xl font-semibold">Gratis från första klicket</h3>
                </div>
              </div>
              <p className="text-slate-900">
                Vi tycker inte att studenter ska behöva betala för att hitta någonstans att bo. Därför är CampusLyan helt gratis – från bevakningar och köinformation till annonser och kartvy. Vårt mål är enkelt: göra Sveriges bostadsmarknad mer rättvis för studenter.
              </p>
            </article>

            <article className="rounded-3xl bg-white/90 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="h-10 w-10 rounded-full bg-brand/10 p-2 text-brand" />
                <div>
                  <p className="text-sm uppercase tracking-wide text-brand">Trygghet & teknik</p>
                  <h3 className="text-xl font-semibold">Byggt för att skydda dig</h3>
                </div>
              </div>
              <p className="text-slate-900">
                Alla profiler och annonser verifieras, och vi arbetar aktivt med att stoppa fejkannonser och oseriösa värdar. Med säker inloggning och krypterad databehandling kan du använda plattformen med full trygghet.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

