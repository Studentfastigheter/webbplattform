import type { Metadata } from "next";

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
    <main className="p-6">
      <h1 className="text-2xl font-semibold">
        {localizedText(locale, "[Erbjudanden]", "[Offers]")}
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        {localizedText(locale, "Innehåll kommer senare.", "Content coming later.")}
      </p>
    </main>
  );
}
