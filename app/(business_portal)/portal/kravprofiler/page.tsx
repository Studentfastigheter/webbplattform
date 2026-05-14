"use client";

import { useEffect, useMemo, useState } from "react";
import { FileCheck2, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { listingService } from "@/services/listing-service";
import type { RequirementsProfileDTO } from "@/types/listing";

function formatAgeRequirement(profile: RequirementsProfileDTO) {
  if (typeof profile.minAge === "number" && typeof profile.maxAge === "number") {
    return `${profile.minAge}-${profile.maxAge} år`;
  }

  if (typeof profile.minAge === "number") {
    return `Min ${profile.minAge} år`;
  }

  if (typeof profile.maxAge === "number") {
    return `Max ${profile.maxAge} år`;
  }

  return "-";
}

export default function RequirementsProfilesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [profiles, setProfiles] = useState<RequirementsProfileDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!companyId) {
      setProfiles([]);
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
      })
      .catch((requestError) => {
        if (!active) return;
        setProfiles([]);
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

  const requiredDocumentCount = useMemo(
    () =>
      profiles.reduce(
        (sum, profile) => sum + (profile.requiredDocuments?.length ?? 0),
        0
      ),
    [profiles]
  );

  const summary = [
    {
      icon: <FileCheck2 className="h-6 w-6" />,
      label: "Kravprofiler",
      value: profiles.length.toLocaleString("sv-SE"),
    },
    {
      icon: <FileText className="h-6 w-6" />,
      label: "Dokumentkrav",
      value: requiredDocumentCount.toLocaleString("sv-SE"),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Kravprofiler</h1>
      </div>

      {authLoading || loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="h-5 w-44 rounded bg-gray-100" />
          <div className="mt-6 grid gap-3">
            {[0, 1, 2].map((item) => (
              <div className="h-14 rounded-lg bg-gray-100" key={item} />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Kravprofiler</h2>
          <p className="mt-2 text-theme-sm text-gray-500">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-2">
            {summary.map((item) => (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6" key={item.label}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-800">
                  {item.icon}
                </div>
                <div className="mt-5">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <h3 className="mt-2 text-title-sm font-bold text-gray-800">{item.value}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Kravprofiler</h2>
              <p className="mt-1 text-theme-sm text-gray-500">
                Alla kravprofiler som hör till det aktiva företaget.
              </p>
            </div>

            {profiles.length === 0 ? (
              <div className="border-t border-gray-100 py-10 text-center text-theme-sm text-gray-500">
                Inga kravprofiler hittades för företaget.
              </div>
            ) : (
              <div className="max-w-full overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="border-y border-gray-100">
                    <tr>
                      {["Namn", "Ålderskrav", "Dokument", "Beskrivning"].map((heading) => (
                        <th className="py-3 text-theme-xs font-medium text-gray-500" key={heading}>
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {profiles.map((profile, index) => {
                      const documents = profile.requiredDocuments ?? [];
                      const profileKey = profile.id ?? `${profile.title ?? "profile"}-${index}`;

                      return (
                        <tr key={profileKey}>
                          <td className="py-4 pr-6">
                            <p className="text-theme-sm font-medium text-gray-800">
                              {profile.title || "Namnlös kravprofil"}
                            </p>
                            {profile.id ? (
                              <span className="text-theme-xs text-gray-500">ID {profile.id}</span>
                            ) : null}
                          </td>
                          <td className="py-4 pr-6 text-theme-sm text-gray-600">
                            {formatAgeRequirement(profile)}
                          </td>
                          <td className="py-4 pr-6">
                            {documents.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {documents.map((document, documentIndex) => (
                                  <span
                                    className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-theme-xs font-medium text-gray-700"
                                    key={`${profileKey}-${document.documentName}-${documentIndex}`}
                                  >
                                    {document.documentName}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-theme-sm text-gray-500">-</span>
                            )}
                          </td>
                          <td className="max-w-[360px] py-4 text-theme-sm text-gray-600">
                            {profile.description || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
