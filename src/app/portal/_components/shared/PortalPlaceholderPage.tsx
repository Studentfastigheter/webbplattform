"use client";

import Link from "next/link";
import { Clock3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import { dashboardRelPath } from "../../_statics/variables";

type PortalPlaceholderPageProps = {
  title: string;
  titleEn: string;
  notes?: string[];
  notesEn?: string[];
};

export default function PortalPlaceholderPage({
  title,
  titleEn,
  notes = [],
  notesEn = [],
}: PortalPlaceholderPageProps) {
  const { locale } = useI18n();
  const localizedNotes = locale === "en" ? notesEn : notes;

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          {localizedText(locale, title, titleEn)}
        </h1>
      </header>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardContent className="flex flex-col items-start gap-4 px-6 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
            <Clock3 className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {localizedText(locale, "Kommer snart", "Coming soon")}
            </h2>
            <p className="text-sm text-gray-500">
              {localizedText(locale, "Sidan är under arbete.", "This page is under development.")}
            </p>
          </div>

          {localizedNotes.length > 0 ? (
            <ul className="space-y-2 text-sm text-gray-600">
              {localizedNotes.map((note) => (
                <li
                  key={note}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                >
                  {note}
                </li>
              ))}
            </ul>
          ) : null}

          <Link
            href={dashboardRelPath}
            className="inline-flex items-center text-sm font-medium text-[#004225] hover:underline"
          >
            {localizedText(locale, "Till översikten", "Go to overview")}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
