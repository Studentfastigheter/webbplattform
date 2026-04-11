import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

import SiteFooter from "@/components/SiteFooter/SiteFooter";
import SiteHeader from "@/components/SiteHeader/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white px-6 pt-20 text-[#0a2d1d]">
        <section className="mx-auto flex min-h-[72vh] max-w-4xl flex-col justify-center py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#004225]/70">
            Felkod 808
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-[#082719] sm:text-6xl">
            Sidan finns inte.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-[#5a6760] sm:text-lg">
            Länken kan vara gammal, flyttad eller felstavad. Börja om från
            startsidan eller fortsätt direkt till bostäder.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#004225] px-5 text-sm font-semibold text-white transition hover:bg-[#00341d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Till startsidan
            </Link>
            <Link
              href="/bostader"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#004225]/20 px-5 text-sm font-semibold text-[#004225] transition hover:border-[#004225]/40 hover:bg-[#f4f8f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225]"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Sök bostäder
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
