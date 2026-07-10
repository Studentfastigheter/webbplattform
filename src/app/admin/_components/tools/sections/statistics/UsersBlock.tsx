"use client";

import { TrendBarChart } from "@/features/analytics/components/TrendBarChart";
import {
  useAdminQuickRegisterStatistics,
  useAdminUsersStatistics,
} from "@/features/admin/hooks/useAdmin";
import { ActionShell } from "../../shared";
import { errorMessage, formatCount, toTrendData } from "./helpers";

const QUICK_REGISTER_INTERVAL = [
  { value: "3m", label: "3 månader", months: 3 },
];

export function UsersBlock() {
  const usersQuery = useAdminUsersStatistics();
  const quickQuery = useAdminQuickRegisterStatistics();

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="min-w-0 xl:col-span-2">
      <ActionShell
        title="Registrerade studenter"
        description="Nya studentregistreringar per dag under de senaste 12 månaderna."
        method="GET"
        endpoint="/api/admin/statistics/users"
      >
        <div className="mt-4 h-[360px]">
          <TrendBarChart
            data={toTrendData(usersQuery.data?.registrations)}
            title="Nya registreringar"
            valueLabel="Registreringar"
            loading={usersQuery.isLoading}
            error={
              usersQuery.isError
                ? errorMessage(usersQuery.error, "Kunde inte hämta registreringar.")
                : null
            }
            emptyMessage="Inga registreringar under perioden."
            embedded
          />
        </div>
        {usersQuery.data ? (
          <p className="mt-3 text-xs text-[#66716f]">
            Totalt {formatCount(usersQuery.data.total)} studenter, varav{" "}
            {formatCount(usersQuery.data.verified)} verifierade.
          </p>
        ) : null}
      </ActionShell>
      </div>

      <div className="min-w-0">
      <ActionShell
        title="Snabbregistreringar"
        description="Påbörjade konton som ännu inte slutfört registreringen. Raden tas bort vid fullföljd registrering, så trenden visar inflöde."
        method="GET"
        endpoint="/api/admin/statistics/quick-registers"
      >
        <div className="mt-4 rounded-[8px] border border-[#dfe7e3] bg-[#fbfcfb] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#476e66]">
            Väntande just nu
          </p>
          <p className="mt-2 text-3xl font-semibold text-[#111827]">
            {formatCount(quickQuery.data?.pending)}
          </p>
        </div>
        <div className="mt-4 h-[240px]">
          <TrendBarChart
            data={toTrendData(quickQuery.data?.created)}
            title="Nya per dag"
            valueLabel="Snabbregistreringar"
            intervals={QUICK_REGISTER_INTERVAL}
            loading={quickQuery.isLoading}
            error={
              quickQuery.isError
                ? errorMessage(quickQuery.error, "Kunde inte hämta snabbregistreringar.")
                : null
            }
            emptyMessage="Inga snabbregistreringar under perioden."
            embedded
            showSummary={false}
          />
        </div>
      </ActionShell>
      </div>
    </div>
  );
}
