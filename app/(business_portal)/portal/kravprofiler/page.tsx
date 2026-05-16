"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { listingService } from "@/services/listing-service";
import type { RequirementsProfileDTO } from "@/types/listing";

function getProfileKey(profile: RequirementsProfileDTO, index: number) {
  return profile.id ?? `${profile.title ?? "profile"}-${index}`;
}

export default function RequirementsProfilesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [profiles, setProfiles] = useState<RequirementsProfileDTO[]>([]);
  const [selectedProfileKey, setSelectedProfileKey] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!companyId) {
      setProfiles([]);
      setSelectedProfileKey(null);
      setLoading(false);
      setError("Kunde inte hitta ett aktivt företag för kontot.");
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    listingService
      .getRequirementsProfilesByCompany(companyId)
      .then((result) => {
        if (!active) return;
        setProfiles(result);
        setSelectedProfileKey(
          result.length > 0 ? getProfileKey(result[0], 0) : null
        );
      })
      .catch((requestError) => {
        if (!active) return;
        setProfiles([]);
        setSelectedProfileKey(null);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Kunde inte hämta kravprofilerna."
        );
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, companyId]);

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Kravprofiler</h1>
      </div>

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
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Kravprofiler</h2>
          <p className="mt-2 text-theme-sm text-gray-500">{error}</p>
        </div>
      ) : (
        <div className="grid min-h-[520px] gap-4 lg:h-[calc(100vh-220px)] lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <p className="text-sm font-medium text-gray-600">
                Totalt {profiles.length.toLocaleString("sv-SE")} st
              </p>
            </div>

            {profiles.length === 0 ? (
              <div className="flex flex-1 items-center justify-center px-5 py-10 text-center text-theme-sm text-gray-500">
                Inga kravprofiler hittades för företaget.
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
                          {profile.title || "Namnlös kravprofil"}
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
                    {selectedProfile.title || "Namnlös kravprofil"}
                  </h2>

                  <div>
                    <h3 className="mt-6 text-sm font-semibold text-gray-900">
                      Beskrivning
                    </h3>
                    <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-5">
                      <p className="whitespace-pre-line text-theme-sm leading-6 text-gray-600">
                        {selectedProfile.description ||
                          "Ingen beskrivning angiven."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Dokument som krävs
                    </h3>
                    {selectedDocuments.length > 0 ? (
                      <div className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
                        {selectedDocuments.map((document, documentIndex) => (
                          <div
                            className="flex min-w-0 items-center gap-3 px-4 py-3"
                            key={`${
                              selectedProfile.id ?? selectedProfile.title
                            }-${document.documentName}-${documentIndex}`}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                              <FileText className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {document.documentName}
                              </p>
                              {document.documentType ? (
                                <p className="mt-0.5 text-xs text-gray-500">
                                  {document.documentType}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-gray-300 px-4 py-5 text-theme-sm text-gray-500">
                        <Info className="h-4 w-4 shrink-0" />
                        Inga dokumentkrav är angivna för den här profilen.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[360px] items-center justify-center px-6 py-10 text-center text-theme-sm text-gray-500">
                Välj en kravprofil i listan för att visa informationen.
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
