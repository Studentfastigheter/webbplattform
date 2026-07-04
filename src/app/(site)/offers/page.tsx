import type { Metadata } from "next";

import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { getRequestLocale } from "@/i18n/server";
import { localizedText } from "@/i18n/text";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Erbjudanden",
  "Erbjudandesidan publiceras när innehållet är färdigt."
);

export default async function Page() {
  const locale = await getRequestLocale();

  return (
    <main className="flex min-h-[55svh] items-center justify-center px-6 py-20">
      <div className="max-w-lg text-center">
        <span className="inline-block rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
          {localizedText(locale, "På väg", "Coming soon")}
        </span>
        <h1 className="mt-5 text-3xl font-bold text-foreground sm:text-4xl">
          {localizedText(locale, "Studenterbjudanden är på väg", "Student offers are on the way")}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {localizedText(
            locale,
            "Vi samlar rabatter och erbjudanden från våra partners — allt från boende till studentlivet runtomkring. Sidan öppnar när de första erbjudandena är klara.",
            "We are gathering discounts and offers from our partners — from housing to student life around it. The page opens when the first offers are ready."
          )}
        </p>
        <div className="mt-8">
          <Link
            href="/partners"
            className="inline-flex items-center rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {localizedText(locale, "Se våra partners", "See our partners")}
          </Link>
        </div>
      </div>
    </main>
  );
}
