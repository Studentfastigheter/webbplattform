"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Info } from "@/components/icons";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText, numberLocale } from "@/i18n/text";
import { getActiveCompanyId } from "@/lib/company-access";
import { useCompanyRequirementsProfiles } from "@/features/listings/hooks/useListings";
import type { RequirementsProfileDTO } from "@/types/listing";
import { PortalPage, PortalSurface } from "../_components/shared/PortalGrid";
import PortalPageHeader from "../_components/shared/PortalPageHeader";

function getProfileKey(profile: RequirementsProfileDTO, index: number) {
  return profile.id ?? `${profile.title ?? "profile"}-${index}`;
}

export default function RequirementsProfilesPage() {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [selectedProfileKey, setSelectedProfileKey] = useState<string | null>(
    null
  );
  const profilesQuery = useCompanyRequirementsProfiles(companyId, {
    enabled: !authLoading,
  });
  const profiles = profilesQuery.data ?? [];
  const loading = profilesQuery.isLoading;
  const error =
    !authLoading && !companyId
      ? "Kunde inte hitta ett aktivt företag för kontot."
      : profilesQuery.isError
        ? profilesQuery.error instanceof Error
          ? profilesQuery.error.message
          : "Kunde inte hämta kravprofilerna."
        : null;

  useEffect(() => {
    if (profiles.length === 0) {
      setSelectedProfileKey(null);
      return;
    }

    setSelectedProfileKey((current) => {
      if (
        current &&
        profiles.some((profile, index) => getProfileKey(profile, index) === current)
      ) {
        return current;
      }

      return getProfileKey(profiles[0], 0);
    });
  }, [profiles]);
  const selectedProfile = useMemo(() => {
    if (!selectedProfileKey) return profiles[0] ?? null;

    return (
      profiles.find((profile, index) => {
        return getProfileKey(profile, index) === selectedProfileKey;
      }) ?? profiles[0] ?? null
    );
  }, [profiles, selectedProfileKey]);

  const selectedDocuments = selectedProfile?.requiredDocuments ?? [];

  return (
    <PortalPage>
      <PortalPageHeader
        title={localizedText(locale, "Kravprofiler", "Requirement profiles")}
        description={localizedText(
          locale,
          "Granska krav, dokument och urvalsprofiler kopplade till f\u00f6retagets annonser.",
          "Review requirements, documents and selection profiles connected to company listings."
        )}
      />

      {authLoading || loading ? (
        <div className="grid min-h-[520px] gap-4 lg:h-[calc(100vh-220px)] lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="h-5 w-36 rounded bg-gray-100" />
            <div className="mt-5 grid gap-3">
              {[0, 1, 2, 3].map((item) => (
                <div className="h-16 rounded-xl bg-gray-100" key={item} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="h-7 w-64 rounded bg-gray-100" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="h-24 rounded-xl bg-gray-100" />
              <div className="h-24 rounded-xl bg-gray-100" />
            </div>
            <div className="mt-6 h-40 rounded-xl bg-gray-100" />
          </div>
        </div>
      ) : error ? (
        <PortalSurface padding="md">
          <h2 className="text-lg font-semibold text-gray-900">
            {localizedText(locale, "Kravprofiler", "Requirement profiles")}
          </h2>
          <p className="mt-2 text-theme-sm text-gray-500">{error}</p>
        </PortalSurface>
      ) : (
        <div className="grid min-h-[520px] gap-4 lg:h-[calc(100vh-220px)] lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <p className="text-sm font-medium text-gray-600">
                {localizedText(
                  locale,
                  `Totalt ${profiles.length.toLocaleString(numberLocale(locale))} st`,
                  `${profiles.length.toLocaleString(numberLocale(locale))} total`
                )}
              </p>
            </div>

            {profiles.length === 0 ? (
              <div className="flex flex-1 items-center justify-center px-5 py-10 text-center text-theme-sm text-gray-500">
                {localizedText(locale, "Inga kravprofiler hittades för företaget.", "No requirement profiles were found for the company.")}
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                <div className="grid gap-1">
                  {profiles.map((profile, index) => {
                    const profileKey = getProfileKey(profile, index);
                    const isSelected =
                      selectedProfile === profile ||
                      selectedProfileKey === profileKey;

                    return (
                      <button
                        type="button"
                        className={`relative w-full rounded-lg px-3 py-3 pl-4 text-left text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-[#004225]/5 text-[#004225]"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        key={profileKey}
                        onClick={() => setSelectedProfileKey(profileKey)}
                      >
                        {isSelected ? (
                          <span className="absolute bottom-2 left-1.5 top-2 w-1 rounded-full bg-[#004225]" />
                        ) : null}
                        <span className="block truncate">
                          {profile.title || localizedText(locale, "Namnlös kravprofil", "Untitled requirement profile")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          <section className="min-h-0 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {selectedProfile ? (
              <div className="h-full min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
                <div className="mx-auto max-w-3xl">
                  <h2 className="break-words text-xl font-semibold text-gray-900">
                    {selectedProfile.title || localizedText(locale, "Namnlös kravprofil", "Untitled requirement profile")}
                  </h2>

                  <div>
                    <h3 className="mt-6 text-sm font-semibold text-gray-900">
                      {localizedText(locale, "Beskrivning", "Description")}
                    </h3>
                    <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-5">
                      <p className="whitespace-pre-line text-theme-sm leading-6 text-gray-600">
                        {selectedProfile.description ||
                          localizedText(locale, "Ingen beskrivning angiven.", "No description provided.")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {localizedText(locale, "Dokument som krävs", "Required documents")}
                    </h3>
                    {selectedDocuments.length > 0 ? (
                      <div className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
                        {selectedDocuments.map((document, documentIndex) => (
                          <div
                            className="flex min-w-0 items-center gap-3 px-4 py-3"
                            key={`${
                              selectedProfile.id ?? selectedProfile.title
                            }-${document.caption ?? "document"}-${documentIndex}`}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                              <FileText className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {document.caption ?? localizedText(locale, "Dokument", "Document")}
                              </p>
                              {document.validTypes?.length ? (
                                <p className="mt-0.5 text-xs text-gray-500">
                                  {document.validTypes.join(", ")}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-gray-300 px-4 py-5 text-theme-sm text-gray-500">
                        <Info className="h-4 w-4 shrink-0" />
                        {localizedText(locale, "Inga dokumentkrav är angivna för den här profilen.", "No document requirements are set for this profile.")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[360px] items-center justify-center px-6 py-10 text-center text-theme-sm text-gray-500">
                {localizedText(locale, "Välj en kravprofil i listan för att visa informationen.", "Choose a requirement profile in the list to view details.")}
              </div>
            )}
          </section>
        </div>
      )}
    </PortalPage>
  );
}
