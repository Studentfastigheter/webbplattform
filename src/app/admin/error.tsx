"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin render error", error);
  }, [error]);

  return (
    <main className="flex min-h-[70svh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
          Något gick fel
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-950">
          Adminvyn kunde inte visas
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-500">
          Ett oväntat fel inträffade. Prova igen, eller byt sektion i menyn.
        </p>
        <div className="mt-8 flex items-center justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a5232] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Försök igen
          </button>
        </div>
      </div>
    </main>
  );
}
