"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import ListFrame, { type ListFrameColumn } from "@/components/layout/ListFrame";
import { buildQueueRow, type QueueRowProps } from "@/components/Queues/QueueRow";
import { useAuth } from "@/context/AuthContext";
import { queueService } from "@/services/queue-service";

const statusToRowStatus = (status?: string): QueueRowProps["status"] => {
  const normalized = status?.toLowerCase();
  if (normalized === "active" || normalized === "open") return "Aktiv";
  if (normalized === "offered") return "Erbjudande";
  return "Inaktiv";
};

export default function Page() {
  const columns: ListFrameColumn[] = [
    { id: "name", label: "Kö", width: "2.4fr" },
    { id: "city", label: "Stad", width: "1.6fr" },
    { id: "status", label: "Status", align: "center", width: "1.2fr" },
    { id: "days", label: "Kötid", align: "left", width: "1fr" },
    { id: "hantera", label: " ", align: "center", width: "1.1fr" },
  ];

  const { user } = useAuth();
  const [queueRows, setQueueRows] = useState<QueueRowProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setQueueRows([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    queueService
      .getMyQueues()
      .then((userApplications) => {
        if (!active) return;

        const rows = userApplications
          .filter((app) => app.queueId != null)
          .map((app) => {
            const queueId = String(app.queueId);
            const queue = app.queue;
            const company = queue?.company;
            const companyId = company?.id;
            const city = queue?.city ?? company?.city ?? null;

            return {
              id: queueId,
              name: app.queueName ?? queue?.name ?? "Okänd kö",
              logoUrl:
                queue?.logoUrl ??
                company?.logoUrl ??
                "/logos/campuslyan-logo.svg",
              cities: city ? [city] : [],
              status: statusToRowStatus(app.status ?? queue?.status ?? undefined),
              days: app.queueDays ?? 0,
              onManage: () => {
                window.location.href = companyId != null
                  ? `/alla-koer/${companyId}`
                  : "/alla-koer";
              },
            };
          });

        setQueueRows(rows);
      })
      .catch((err: unknown) => {
        if (!active) return;
        console.error(err);
        setError("Kunde inte ladda dina köer.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const rows = useMemo(() => queueRows.map(buildQueueRow), [queueRows]);

  return (
    <main className="w-full py-6">
      <div className="w-full">
        {!user && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Logga in för att se dina köer.
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
                ? "Laddar dina köplatser..."
                : user
                ? "Du står inte i några bostadsköer än."
                : "Du måste vara inloggad för att se dina köer."}
            </div>
          }
        />
      </div>
    </main>
  );
}
