"use client";

import { RefreshCwIcon } from "@/components/icons";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { CHART_PRIMARY_DEEP } from "@/features/analytics/chart-palette";
import { useAdminWaitlistStats } from "@/features/admin/hooks/useAdmin";
import type { AdminWaitlistEntryDTO, AdminWaitlistStatsDTO } from "@/types";
import {
  type AdminActionState,
  ResultBlock,
  ActionShell,
} from "../shared";

const waitlistChartConfig = {
  count: {
    label: "Nya anmälningar",
    color: CHART_PRIMARY_DEEP,
  },
} satisfies ChartConfig;

const waitlistDateFormatter = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "short",
});

const waitlistFullDateFormatter = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const waitlistTimestampFormatter = new Intl.DateTimeFormat("sv-SE", {
  dateStyle: "medium",
  timeStyle: "short",
});

type WaitlistChartDatum = {
  date: string;
  label: string;
  fullLabel: string;
  count: number;
  cumulative: number;
};

function parseDateOnly(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatWaitlistTimestamp(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Tidpunkt saknas"
    : waitlistTimestampFormatter.format(date);
}

function toWaitlistChartData(stats: AdminWaitlistStatsDTO | null): WaitlistChartDatum[] {
  return (stats?.daily ?? [])
    .map((point) => {
      const date = parseDateOnly(point.date);
      if (!date) return null;

      return {
        date: point.date,
        label: waitlistDateFormatter.format(date).replace(".", ""),
        fullLabel: waitlistFullDateFormatter.format(date),
        count: point.count,
        cumulative: point.cumulative,
      };
    })
    .filter((point): point is WaitlistChartDatum => point !== null);
}

function WaitlistTrendChart({ data }: { data: WaitlistChartDatum[] }) {
  if (data.length === 0) {
    return (
      <div className="mt-5 flex min-h-[240px] items-center justify-center rounded-[8px] border border-dashed border-[#dfe7e3] px-4 text-center text-sm text-[#66716f]">
        Ingen trenddata att visa ännu.
      </div>
    );
  }

  return (
    <div className="mt-5 min-h-[280px] min-w-0">
      <ChartContainer
        className="h-[clamp(260px,32vw,360px)] w-full"
        config={waitlistChartConfig}
      >
        <BarChart
          barCategoryGap={data.length > 18 ? "20%" : "32%"}
          data={data}
          margin={{ bottom: 0, left: 0, right: 8, top: 16 }}
        >
          <CartesianGrid stroke="#edf2ef" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="label"
            interval={data.length > 14 ? "preserveStartEnd" : 0}
            minTickGap={8}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
            tickMargin={12}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
            tickMargin={8}
            width={38}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const row = payload?.[0]?.payload as WaitlistChartDatum | undefined;
                  return row?.fullLabel ?? "";
                }}
              />
            }
            cursor={false}
          />
          <Bar
            dataKey="count"
            fill="var(--color-count)"
            maxBarSize={20}
            name="Nya anmälningar"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

function storageLabel(storage: AdminWaitlistStatsDTO["storage"]) {
  if (storage === "firestore") return "Firestore";
  if (storage === "local") return "Lokal dev-fil";
  return "Okänd källa";
}

function WaitlistEntriesList({ entries }: { entries: AdminWaitlistEntryDTO[] }) {
  return (
    <div className="mt-6 min-w-0">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#111827]">Alla registrerade</h3>
          <p className="text-sm text-[#66716f]">
            E-post och registreringstid för alla poster som hämtades från databasen.
          </p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-[#476e66]">
          {entries.length.toLocaleString("sv-SE")} poster
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="mt-3 rounded-[8px] border border-dashed border-[#dfe7e3] px-4 py-8 text-center text-sm text-[#66716f]">
          Inga e-postadresser finns i waitlisten ännu.
        </div>
      ) : (
        <div className="mt-3 max-h-[440px] overflow-auto rounded-[8px] border border-[#dfe7e3]">
          <table className="min-w-full divide-y divide-[#edf2ef] text-left text-sm">
            <thead className="sticky top-0 bg-[#fbfcfb] text-xs font-semibold uppercase tracking-wide text-[#476e66]">
              <tr>
                <th className="px-4 py-3">E-post</th>
                <th className="px-4 py-3">Registrerad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2ef] bg-white">
              {entries.map((entry) => (
                <tr key={`${entry.email}-${entry.createdAt}`}>
                  <td className="break-all px-4 py-3 font-medium text-[#111827]">
                    {entry.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#36534d]">
                    {formatWaitlistTimestamp(entry.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function WaitlistDashboard() {
  // Page-mount read via TanStack — the refetch button below calls the
  // query's `refetch` directly so the "Uppdatera" UX stays one click.
  const waitlistQuery = useAdminWaitlistStats();
  const stats = waitlistQuery.data ?? null;
  const state: AdminActionState = waitlistQuery.isError
    ? {
        status: "error",
        message:
          waitlistQuery.error instanceof Error
            ? waitlistQuery.error.message
            : "Kunde inte hämta waitlist-statistik.",
      }
    : waitlistQuery.isLoading || waitlistQuery.isFetching
    ? { status: "loading", message: "Hämtar waitlist..." }
    : { status: "idle" };

  const refresh = () => waitlistQuery.refetch();

  const chartData = toWaitlistChartData(stats);
  const lastSevenDays = (stats?.daily ?? [])
    .slice(-7)
    .reduce((sum, point) => sum + point.count, 0);
  const latestDay = stats?.daily.at(-1);

  return (
    <ActionShell
      title="Waitlist"
      description="Översikt, daglig graf och alla registrerade e-postadresser i waitlisten."
      method="GET"
      endpoint="/api/admin/waitlist"
    >
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ResultBlock state={state} />
        <Button
          type="button"
          isLoading={state.status === "loading"}
          onPress={() => void refresh()}
          className="bg-brand text-white hover:bg-[#00351e]"
        >
          <RefreshCwIcon className="h-4 w-4" />
          Uppdatera
        </Button>
      </div>

      {stats ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-[8px] border border-[#dfe7e3] bg-[#fbfcfb] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#476e66]">
                Totalt
              </p>
              <p className="mt-2 text-3xl font-semibold text-[#111827]">
                {stats.total.toLocaleString("sv-SE")}
              </p>
            </div>
            <div className="rounded-[8px] border border-[#dfe7e3] bg-[#fbfcfb] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#476e66]">
                Senaste 7 dagarna
              </p>
              <p className="mt-2 text-3xl font-semibold text-[#111827]">
                {lastSevenDays.toLocaleString("sv-SE")}
              </p>
            </div>
            <div className="rounded-[8px] border border-[#dfe7e3] bg-[#fbfcfb] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#476e66]">
                Källa
              </p>
              <p className="mt-2 text-lg font-semibold text-[#111827]">
                {storageLabel(stats.storage)}
              </p>
              {latestDay ? (
                <p className="mt-1 text-xs text-[#66716f]">
                  Senaste datum: {latestDay.date}
                </p>
              ) : null}
            </div>
          </div>

          <WaitlistTrendChart data={chartData} />

          <WaitlistEntriesList entries={stats.entries} />

          {stats.unknownCreatedAtCount ? (
            <p className="mt-3 text-xs text-[#66716f]">
              {stats.unknownCreatedAtCount.toLocaleString("sv-SE")} poster saknar
              giltigt datum och visas inte i diagrammet.
            </p>
          ) : null}
        </>
      ) : null}
    </ActionShell>
  );
}

export default WaitlistDashboard;
