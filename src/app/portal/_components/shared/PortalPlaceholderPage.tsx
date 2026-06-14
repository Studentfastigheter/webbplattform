"use client";

import Link from "next/link";
import { Clock3 } from "@/components/icons";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import { dashboardRelPath } from "../../_statics/variables";
import {
  PortalEmptyState,
  PortalGrid,
  PortalGridItem,
  PortalPage,
} from "./PortalGrid";
import PortalPageHeader from "./PortalPageHeader";

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
    <PortalPage>
      <PortalPageHeader title={localizedText(locale, title, titleEn)} />

      <PortalGrid>
        <PortalGridItem contentClassName="flex flex-col gap-5 p-6 sm:p-6" size="2x4">
          <PortalEmptyState
            action={
              <Link
                className="inline-flex items-center text-sm font-medium text-[#004225] hover:underline"
                href={dashboardRelPath}
              >
                {localizedText(locale, "Till \u00f6versikten", "Go to overview")}
              </Link>
            }
            className="min-h-0 items-start justify-start text-left"
            description={localizedText(
              locale,
              "Sidan \u00e4r under arbete.",
              "This page is under development."
            )}
            icon={<Clock3 className="h-5 w-5" />}
            title={localizedText(locale, "Kommer snart", "Coming soon")}
          />

          {localizedNotes.length > 0 ? (
            <ul className="grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
              {localizedNotes.map((note) => (
                <li
                  className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                  key={note}
                >
                  {note}
                </li>
              ))}
            </ul>
          ) : null}
        </PortalGridItem>
      </PortalGrid>
    </PortalPage>
  );
}
