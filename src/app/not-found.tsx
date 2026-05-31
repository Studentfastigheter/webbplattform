import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

import SiteFooter from "@/components/layout/site-footer/SiteFooter";
import SiteHeader from "@/components/layout/site-header/SiteHeader";
import { localizeHref } from "@/i18n/config";
import { getDictionary, getRequestLocale } from "@/i18n/server";

export default async function NotFound() {
  const [dictionary, locale] = await Promise.all([getDictionary(), getRequestLocale()]);
  const copy = dictionary.notFound;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white px-6 pt-20 text-[#0a2d1d]">
        <section className="mx-auto flex min-h-[72vh] max-w-4xl flex-col justify-center py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#004225]/70">
            {copy.code}
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-[#082719] sm:text-6xl">
            {copy.title}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-[#5a6760] sm:text-lg">
            {copy.description}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href={localizeHref("/", locale)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#004225] px-5 text-sm font-semibold text-white transition hover:bg-[#00341d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {copy.homeCta}
            </Link>
            <Link
              href={localizeHref("/bostader", locale)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#004225]/20 px-5 text-sm font-semibold text-[#004225] transition hover:border-[#004225]/40 hover:bg-[#f4f8f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225]"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              {copy.housingCta}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
