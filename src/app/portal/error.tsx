"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Portal render error", error);
  }, [error]);

  return (
    <main className="flex min-h-[70svh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#004225]">
          Något gick fel
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-950">
          Sidan kunde inte visas
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-500">
          Ett oväntat fel inträffade i portalen. Din data är opåverkad — prova
          att ladda om sidan.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full bg-[#004225] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a5232] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225]"
          >
            Försök igen
          </button>
          <Link
            href="/"
            className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225]"
          >
            Till översikten
          </Link>
        </div>
      </div>
    </main>
  );
}
