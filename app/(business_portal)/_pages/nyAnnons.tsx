import Link from "next/link";
import { ArrowRight, FileSpreadsheet, HousePlus } from "lucide-react";

import { ImageUploadField } from "@/components/Dashboard/Form";
import { dashboardRelPath } from "../_statics/variables";

export default function NyAnnons() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-semibold text-gray-900">Skapa annons</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Publicera en bostadsannons manuellt eller importera flera annonser
            via CSV.
          </p>
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-220px)] grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <Link
          className="group flex min-h-[360px] flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs transition hover:border-[#004225]/35 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8"
          href={dashboardRelPath + "/annonser/ny/onboarding/1"}
        >
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#004225]/10 text-[#004225]">
              <HousePlus className="h-6 w-6" />
            </div>

            <div className="mt-8 max-w-2xl">
              <p className="text-sm font-medium text-[#004225]">
                Rekommenderat för enstaka bostäder
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                Skapa manuellt
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                Gå igenom ett fokuserat flöde för grunddata, hyra, datum,
                beskrivning, bilder och publicering.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
              {["Grunddata", "Innehåll", "Publicering"].map((item) => (
                <span
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
            <span className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#004225] px-6 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)] transition-colors group-hover:bg-[#004225]/90 sm:w-auto">
              Starta flöde
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>

        <section className="flex min-h-[360px] flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-800">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-gray-950">
                Importera CSV
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Använd import om du vill lägga upp flera objekt samtidigt.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-1">
            <ImageUploadField
              className="flex w-full items-center justify-center border-gray-300 bg-gray-50/60 shadow-none"
              heading="Släpp din CSV-fil här"
              maxSize="5MB"
              supportedFileTypes={[".csv"]}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
