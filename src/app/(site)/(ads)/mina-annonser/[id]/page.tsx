import { getRequestLocale } from "@/i18n/server";
import { localizedText } from "@/i18n/text";

export default async function Page() {
  const locale = await getRequestLocale();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">
        {localizedText(locale, "[Mina annonser /[id]]", "[My listings /[id]]")}
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        {localizedText(locale, "Innehåll kommer senare.", "Content coming later.")}
      </p>
    </main>
  );
}
