"use client";

import clsx from "clsx";
import { useMemo } from "react";
import ListFrame, { type ListFrameColumn } from "@/components/layout/ListFrame";
import { buildQueueRow, type QueueRowProps } from "@/features/queues/components/QueueRow";
import { useAuth } from "@/context/AuthContext";
import { useMyQueues } from "@/features/queues/hooks/useQueues";
import { queueService } from "@/features/queues/services/queue-service";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

const statusToRowStatus = (status?: string): QueueRowProps["status"] => {
  const normalized = status?.toLowerCase();
  if (normalized === "active" || normalized === "open") return "Aktiv";
  if (normalized === "offered") return "Erbjudande";
  return "Inaktiv";
};

export default function Page() {
  const { locale, localizedHref } = useI18n();
  const columns: ListFrameColumn[] = [
    { id: "name", label: localizedText(locale, "Kö", "Queue"), width: "2.4fr" },
    { id: "city", label: localizedText(locale, "Stad", "City"), width: "1.6fr" },
    { id: "status", label: "Status", align: "center", width: "1.2fr" },
    { id: "days", label: localizedText(locale, "Kötid", "Queue time"), align: "left", width: "1fr" },
    { id: "hantera", label: " ", align: "center", width: "1.1fr" },
  ];

  const { user } = useAuth();
  // hydrated=true so we get queue + company info for the row rendering.
  const {
    data: userApplications,
    isLoading: loading,
    isError,
  } = useMyQueues({ hydrated: true });
  const error = isError ? "Kunde inte ladda dina köer." : null;

  const queueRows = useMemo<QueueRowProps[]>(() => {
    if (!user || !userApplications) return [];

    return userApplications
      .filter((app) => app.queueId != null)
      .map((app) => {
        const queueId = String(app.queueId);
        const queue = app.queue;
        const company = queue?.company;
        const companyId = company?.id ?? queue?.companyId;
        const city = queue?.city ?? company?.city ?? null;

        return {
          id: queueId,
          name: app.queueName ?? queue?.name ?? localizedText(locale, "Okänd kö", "Unknown queue"),
          logoUrl:
            queue?.companyLogoUrl ??
            queue?.logoUrl ??
            company?.logoUrl ??
            null,
          cities: city ? [city] : [],
          status: statusToRowStatus(app.status ?? queue?.status ?? undefined),
          days: app.queueDays ?? 0,
          onManage: () => {
            window.location.href = companyId != null
              ? localizedHref(`/all-queues/${companyId}`)
              : localizedHref("/all-queues");
          },
        };
      });
  }, [user, userApplications, locale, localizedHref]);

  const rows = useMemo(() => queueRows.map(buildQueueRow), [queueRows]);

  return (
    <main className="w-full py-6">
      <div className="w-full">
        {!user && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {localizedText(locale, "Logga in för att se dina köer.", "Log in to view your queues.")}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        <ListFrame
          columns={columns}
          rows={rows}
          className={clsx(
            "overflow-hidden rounded-xl border-gray-200 shadow-sm",
            "[&_header]:bg-gray-50/80 [&_header]:px-6 [&_header]:py-3",
            "[&_header_span]:text-xs [&_header_span]:font-semibold [&_header_span]:uppercase [&_header_span]:tracking-normal [&_header_span]:text-gray-500",
            "[&_div.mx-8]:mx-0 [&_div.mx-8]:bg-gray-200",
            "[&_div.divide-y]:divide-gray-100 [&_div.grid]:px-6 [&_div.grid]:py-4"
          )}
          emptyState={
            <div className="py-16 text-center text-sm text-gray-400">
              {loading
                ? localizedText(locale, "Laddar dina köplatser...", "Loading your queue positions...")
                : user
                ? localizedText(locale, "Du står inte i några bostadsköer än.", "You are not in any housing queues yet.")
                : localizedText(locale, "Du måste vara inloggad för att se dina köer.", "You must be logged in to view your queues.")}
            </div>
          }
        />
      </div>
    </main>
  );
}
