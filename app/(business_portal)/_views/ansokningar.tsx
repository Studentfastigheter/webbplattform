"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, ExternalLink, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { companyService, type NewApplication } from "@/services/company";
import { dashboardRelPath } from "../_statics/variables";

export type ApplicationsMode = "interest" | "queue";

type AnsokningarProps = {
  listingId?: string | null;
  mode?: ApplicationsMode;
};

type PortalApplication = NewApplication & {
  rowId: string;
  applicantName: string;
  listingName: string;
  submittedAtLabel: string;
  submittedAtTime: number;
  statusLabel: string;
  statusTone: "neutral" | "success" | "warning" | "danger" | "info";
};

function formatDate(value?: string) {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function parseDate(value?: string) {
  if (!value) return 0;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function applicantName(application: NewApplication) {
  const name = [application.firstName, application.surname]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "Okänd sökande";
}

function normalizeStatus(status?: string): {
  label: string;
  tone: PortalApplication["statusTone"];
} {
  const normalized = status?.trim().toLowerCase() ?? "";

  if (["accepted", "approved", "antagen", "offer_accepted"].includes(normalized)) {
    return { label: "Antagen", tone: "success" };
  }

  if (["rejected", "denied", "declined", "nekad", "offer_rejected"].includes(normalized)) {
    return { label: "Nekad", tone: "danger" };
  }

  if (["offer", "offered", "erbjudande", "pending_offer"].includes(normalized)) {
    return { label: "Erbjudande", tone: "info" };
  }

  if (["processing", "in_progress", "bearbetas"].includes(normalized)) {
    return { label: "Bearbetas", tone: "warning" };
  }

  return { label: "Under granskning", tone: "neutral" };
}

function toPortalApplication(
  application: NewApplication,
  index: number
): PortalApplication {
  const submittedAt = application.submittedAt ?? application.createdAt;
  const status = normalizeStatus(application.status);

  return {
    ...application,
    rowId: String(
      application.applicationId ??
        application.id ??
        `${application.listingId ?? "application"}-${submittedAt ?? index}`
    ),
    applicantName: applicantName(application),
    listingName: application.listingTitle || application.address || "Okänd annons",
    submittedAtLabel: formatDate(submittedAt),
    submittedAtTime: parseDate(submittedAt),
    statusLabel: status.label,
    statusTone: status.tone,
  };
}

function statusClassName(tone: PortalApplication["statusTone"]) {
  switch (tone) {
    case "success":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "warning":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "danger":
      return "bg-red-50 text-red-700 ring-red-200";
    case "info":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    default:
      return "bg-gray-50 text-gray-700 ring-gray-200";
  }
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-950">{value || "-"}</dd>
    </div>
  );
}

function ApplicationRow({
  application,
  expanded,
  onToggle,
}: {
  application: PortalApplication;
  expanded: boolean;
  onToggle: () => void;
}) {
  const listingHref =
    application.listingId != null
      ? `${dashboardRelPath}/annonser/${encodeURIComponent(String(application.listingId))}`
      : null;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="grid w-full grid-cols-[1fr_auto] gap-4 px-5 py-4 text-left transition hover:bg-gray-50 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_140px_150px_24px] md:items-center"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-950">
            {application.applicantName}
          </p>
          <p className="mt-1 truncate text-xs text-gray-500">
            {application.studentEmail || application.studentCity || "Ingen kontaktuppgift"}
          </p>
        </div>

        <div className="hidden min-w-0 md:block">
          <p className="truncate text-sm font-medium text-gray-900">
            {application.listingName}
          </p>
          <p className="mt-1 truncate text-xs text-gray-500">
            {application.listingCity || application.address || "-"}
          </p>
        </div>

        <div className="hidden text-sm text-gray-600 md:block">
          {application.submittedAtLabel}
        </div>

        <div className="hidden md:block">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusClassName(
              application.statusTone
            )}`}
          >
            {application.statusLabel}
          </span>
        </div>

        <div className="flex items-center justify-end text-gray-400">
          {expanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </div>

        <div className="col-span-2 flex flex-wrap items-center gap-2 md:hidden">
          <span className="text-xs text-gray-500">{application.submittedAtLabel}</span>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${statusClassName(
              application.statusTone
            )}`}
          >
            {application.statusLabel}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="bg-gray-50 px-5 py-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
            <div>
              <h2 className="text-sm font-semibold text-gray-950">Ansökan</h2>
              <div className="mt-2 rounded-md border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-700">
                {application.message || "Ingen meddelandetext skickades med ansökan."}
              </div>
            </div>

            <div className="space-y-4">
              <dl className="grid grid-cols-1 gap-4 rounded-md border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-1">
                <DetailItem label="Sökande" value={application.applicantName} />
                <DetailItem label="E-post" value={application.studentEmail} />
                <DetailItem label="Stad" value={application.studentCity} />
                <DetailItem label="Skola" value={application.studentSchool} />
                <DetailItem label="Program" value={application.studentProgram} />
                <DetailItem label="Annons" value={application.listingName} />
                <DetailItem label="Plats" value={application.listingCity || application.address} />
                <DetailItem
                  label="Hyra"
                  value={
                    application.listingRent
                      ? `${application.listingRent.toLocaleString("sv-SE")} kr/mån`
                      : null
                  }
                />
              </dl>

              <div className="flex flex-wrap gap-2">
                {application.studentEmail && (
                  <a
                    href={`mailto:${application.studentEmail}`}
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
                  >
                    <Mail className="h-4 w-4" />
                    Mejla
                  </a>
                )}

                {listingHref && (
                  <Link
                    href={listingHref}
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Öppna annons
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Ansokningar({
  listingId = null,
  mode = "interest",
}: AnsokningarProps) {
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [applications, setApplications] = useState<PortalApplication[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || mode !== "interest") {
      return;
    }

    if (!companyId) {
      setApplications([]);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    companyService
      .applications(companyId)
      .then((result) => {
        if (!active) return;

        setApplications(
          result
            .map(toPortalApplication)
            .sort((a, b) => b.submittedAtTime - a.submittedAtTime)
        );
      })
      .catch((requestError) => {
        if (!active) return;

        setApplications([]);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Kunde inte hämta ansökningar."
        );
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, companyId, mode]);

  const visibleApplications = useMemo(() => {
    if (!listingId) {
      return applications;
    }

    return applications.filter(
      (application) => String(application.listingId ?? "") === String(listingId)
    );
  }, [applications, listingId]);

  if (authLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
        Laddar ansökningar...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Logga in för att se företagets ansökningar.
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Denna sida är bara tillgänglig för företagskonton.
      </div>
    );
  }

  if (mode === "queue") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Bostadskö</h1>
        <section className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          Köansökningar visas inte via /api/applications.
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Ansökningar</h1>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Hämtar företagets ansökningar...
        </div>
      ) : visibleApplications.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          Det finns inga ansökningar att visa ännu.
        </div>
      ) : (
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="hidden border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_140px_150px_24px]">
            <span>Sökande</span>
            <span>Annons</span>
            <span>Datum</span>
            <span>Status</span>
            <span />
          </div>

          {visibleApplications.map((application) => (
            <ApplicationRow
              key={application.rowId}
              application={application}
              expanded={expandedId === application.rowId}
              onToggle={() =>
                setExpandedId((current) =>
                  current === application.rowId ? null : application.rowId
                )
              }
            />
          ))}
        </section>
      )}
    </div>
  );
}
