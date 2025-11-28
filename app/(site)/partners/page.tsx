"use client";

import { ArrowUpRight } from "lucide-react";
import { useMemo, type ReactNode } from "react";

type Company = {
  id: number;
  name: string;
  city?: string | null;
  description?: string | null;
  website?: string | null;
  logoUrl?: string | null;
};

type Union = { name: string; city?: string; url?: string; logoUrl?: string };

const COMPANY_DESCRIPTION_FALLBACK =
  "Publicerar sina studentbostäder hos CampusLyan";

// Lägg till/uppdatera partners här. logoUrl ska peka på filer under /public.
const PARTNER_COMPANIES: Company[] = [
  {
    id: 1,
    name: "SGS Studentbostäder",
    city: "Göteborg",
    website: "https://www.sgs.se",
    logoUrl: "/logos/sgs-logo.svg",
    description: "",
  },
  {
    id: 2,
    name: "Guldhedens Studiehem",
    city: "Göteborg",
    website: "https://www.guldheden.com",
    logoUrl: "/logos/guldhedens_studiehem.png",
    description: "",
  },
];

const STUDENT_UNIONS: Union[] = [

];

function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <header className="mb-6">
      {eyebrow && <p className="eyebrow text-brand">{eyebrow}</p>}
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>
    </header>
  );
}

function LogoBadge({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  const initials = useMemo(() => {
    return name
      .split(/\s+/)
      .map((part) => part.trim()[0])
      .filter(Boolean)
      .slice(0, 3)
      .join("")
      .toUpperCase();
  }, [name]);

  return (
    <div className="h-12 w-12 rounded-xl bg-neutral-100 grid place-items-center overflow-hidden ring-1 ring-black/5">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={`${name} logotyp`} className="h-full w-full object-contain" loading="lazy" />
      ) : (
        <span className="text-xs font-semibold text-neutral-500">{initials}</span>
      )}
    </div>
  );
}

function Card({ children, href }: { children: ReactNode; href?: string }) {
  const baseClass =
    "group relative flex h-full flex-col rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={baseClass}>
        {children}
      </a>
    );
  }

  return <div className={baseClass}>{children}</div>;
}

function CompanyCard({ company }: { company: Company }) {
  const { name, city, description, website, logoUrl } = company;
  return (
    <Card href={website ?? undefined}>
      <div className="flex items-start gap-4">
        <LogoBadge name={name} logoUrl={logoUrl} />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold leading-tight">{name}</h3>
            {website && <ArrowUpRight className="h-4 w-4 text-brand" aria-hidden />}
          </div>
          {city && <p className="text-xs text-neutral-500">Bostäder i {city}</p>}
        </div>
      </div>
      <p className="mt-4 text-sm text-neutral-600 leading-relaxed">{description?.trim() || COMPANY_DESCRIPTION_FALLBACK}</p>
      <div className="mt-5 flex items-center gap-2 text-sm font-medium text-brand">
        {website ? "Besök webbplats" : "Kontakt via CampusLyan"}
        {website && <ArrowUpRight className="h-4 w-4" aria-hidden />}
      </div>
    </Card>
  );
}

function UnionCard({ union }: { union: Union }) {
  return (
    <Card href={union.url}>
      <div className="flex items-start gap-4">
        <LogoBadge name={union.name} logoUrl={union.logoUrl} />
        <div className="space-y-1">
          <h3 className="font-semibold leading-tight">{union.name}</h3>
          {union.city && <p className="text-xs text-neutral-500">{union.city}</p>}
        </div>
      </div>
      {union.url && (
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-brand">
          Besök webbplats
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </div>
      )}
    </Card>
  );
}

export default function PartnersPage() {
  const sortedCompanies = [...PARTNER_COMPANIES].sort((a, b) =>
    (a?.name || "").localeCompare(b?.name || "", "sv", { sensitivity: "base" })
  );

  return (
    <main className="min-h-screen bg-gradient-to-b">
      <section className="section border-b border-black/5">
        <div className="container-page space-y-2 py-10 md:py-14">
          <div className="max-w-3xl space-y-4">
            <p className="eyebrow text-brand">Partners & nätverk</p>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Våra samarbetspartners</h1>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow="Studentbostadsföretag"
            title="Bostadsföretag som publicerar via CampusLyan"
          />

          {sortedCompanies.length === 0 && (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-center text-sm text-neutral-600">
              Inga företag listade ännu. Kom tillbaka snart så visar vi våra samarbetspartners här.
            </div>
          )}

          {sortedCompanies.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sortedCompanies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section border-y border-black/5">
        <div className="container-page">
          <SectionHeading
            eyebrow="Studentkårer"
            title="Studentkårer som rekommenderar sina studenter till CampusLyan"
          />
          {STUDENT_UNIONS.length === 0 && (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-center text-sm text-neutral-600">
              Inga kårer listade ännu. Kom tillbaka snart så visar vi våra samarbetspartners här.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {STUDENT_UNIONS.map((union) => (
              <UnionCard key={union.name} union={union} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="rounded-3xl bg-brand px-6 py-10 text-white shadow-xl md:px-10">
            <div className="space-y-4 md:flex md:items-center md:justify-between md:space-y-0 md:gap-10">
              <div className="space-y-3 max-w-2xl">
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">Vill ni samarbeta med oss?</h3>
                <p className="text-sm text-white/80">
                  Kontakta oss på{ " " }
                  <a className="underline" href="mailto:partner@campuslyan.se">
                    partner@campuslyan.se
                  </a>{ " " }
                  så hör vi av oss med nästa steg.
                </p>
              </div>
              <a
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand shadow-lg transition hover:-translate-y-0.5"
                href="mailto:partner@campuslyan.se"
              >
                Kontakta oss
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
