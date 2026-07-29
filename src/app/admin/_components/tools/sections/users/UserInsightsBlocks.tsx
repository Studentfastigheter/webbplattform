"use client";

import { TrendBarChart } from "@/features/analytics/components/TrendBarChart";
import {
  useAdminRegistrationFunnel,
  useAdminRegistrationMethods,
  useAdminUserKpis,
  useAdminVerificationOutcomes,
} from "@/features/admin/hooks/useAdmin";
import { ActionShell } from "../../shared";
import { DistributionBarList } from "../statistics/DistributionBarList";
import { KpiTile } from "../statistics/KpiTile";
import { errorMessage, formatCount, formatShare, toTrendData } from "../statistics/helpers";

const METHOD_LABELS: Record<string, string> = {
  EMAIL: "E-post",
  GOOGLE: "Google",
  FREJA: "Freja",
  UNKNOWN: "Okänd (före mätning)",
};

const OUTCOME_LABELS: Record<string, string> = {
  MATCHES: "Godkända",
  CANCELED: "Avbrutna",
  EXPIRED: "Utgångna",
  CLASHING: "Kontokrockar",
  PENDING: "Pågående",
  ABANDONED: "Övergivna (>24h)",
};

const FLOW_LABELS: Record<string, string> = {
  FREJA_ONLY: "Direkt Freja-registrering",
  QUICK_UPGRADE: "Uppgradering av snabbkonto",
};

export function methodLabel(key: string) {
  return METHOD_LABELS[key] ?? key;
}

export function UserKpiRow() {
  const query = useAdminUserKpis();
  const kpis = query.data;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <KpiTile
        label="Konton totalt"
        value={formatCount(kpis?.totalAccounts)}
        hint="Studenter + pågående snabbregistreringar"
        loading={query.isLoading}
      />
      <KpiTile
        label="Studenter"
        value={formatCount(kpis?.students)}
        loading={query.isLoading}
      />
      <KpiTile
        label="Snabbregistreringar"
        value={formatCount(kpis?.pendingQuickRegisters)}
        hint="Ej färdigregistrerade"
        loading={query.isLoading}
      />
      <KpiTile
        label="Freja-verifierade"
        value={formatCount(kpis?.verifiedIdentity)}
        hint={kpis ? `${formatShare(kpis.verifiedIdentityRatio)} av alla konton` : undefined}
        loading={query.isLoading}
      />
      <KpiTile
        label="Aktiva senaste 30 dagarna"
        value={formatCount(kpis?.activeLast30Days)}
        hint="Konton med inloggning"
        loading={query.isLoading}
      />
    </div>
  );
}

export function RegistrationMethodsBlock() {
  const query = useAdminRegistrationMethods();

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ActionShell
        title="Registreringsmetod — studenter"
        description="Hur färdigregistrerade studenter skapade sitt konto."
        method="GET"
        endpoint="/api/admin/statistics/registration-methods"
      >
        <div className="mt-4">
          <DistributionBarList
            title="Metod"
            items={query.data?.students}
            loading={query.isLoading}
            labelFor={methodLabel}
            emptyMessage="Inga studenter ännu."
          />
        </div>
      </ActionShell>

      <ActionShell
        title="Registreringsmetod — snabbregistreringar"
        description="Hur pågående (ej slutförda) konton påbörjades."
        method="GET"
        endpoint="/api/admin/statistics/registration-methods"
      >
        <div className="mt-4">
          <DistributionBarList
            title="Metod"
            items={query.data?.quickRegisters}
            loading={query.isLoading}
            labelFor={methodLabel}
            emptyMessage="Inga pågående snabbregistreringar."
          />
        </div>
      </ActionShell>
    </div>
  );
}

export function RegistrationFunnelBlock() {
  const query = useAdminRegistrationFunnel();
  const funnel = query.data;

  return (
    <ActionShell
      title="Verifieringstratt"
      description="Från påbörjad snabbregistrering till slutförd Freja-verifiering, senaste 12 månaderna."
      method="GET"
      endpoint="/api/admin/statistics/registration-funnel"
    >
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <KpiTile
          label="Snabbregistreringar skapade"
          value={formatCount(funnel?.quickRegistersCreated)}
          loading={query.isLoading}
        />
        <KpiTile
          label="Verifieringar startade"
          value={formatCount(funnel?.verificationsStarted)}
          hint={funnel ? `${formatCount(funnel.uniqueUsersStarted)} unika användare` : undefined}
          loading={query.isLoading}
        />
        <KpiTile
          label="Verifieringar slutförda"
          value={formatCount(funnel?.verificationsCompleted)}
          loading={query.isLoading}
        />
      </div>
      <div className="mt-4 h-[300px]">
        <TrendBarChart
          data={toTrendData(funnel?.completedTrend)}
          title="Slutförda verifieringar"
          valueLabel="Verifieringar"
          loading={query.isLoading}
          error={
            query.isError
              ? errorMessage(query.error, "Kunde inte hämta verifieringstratten.")
              : null
          }
          emptyMessage="Inga slutförda verifieringar under perioden."
          embedded
        />
      </div>
    </ActionShell>
  );
}

export function VerificationOutcomesBlock() {
  const query = useAdminVerificationOutcomes();
  const outcomes = query.data;

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="min-w-0 xl:col-span-2">
        <ActionShell
          title="Freja-utfall"
          description="Hur påbörjade Freja-verifieringar slutade, med dagstrend."
          method="GET"
          endpoint="/api/admin/statistics/verification-outcomes"
        >
          <div className="mt-4 h-[300px]">
            <TrendBarChart
              data={toTrendData(outcomes?.attemptsTrend)}
              title="Påbörjade verifieringsförsök"
              valueLabel="Försök"
              loading={query.isLoading}
              error={
                query.isError
                  ? errorMessage(query.error, "Kunde inte hämta Freja-utfallen.")
                  : null
              }
              emptyMessage="Inga verifieringsförsök under perioden."
              embedded
            />
          </div>
          {outcomes ? (
            <p className="mt-3 text-xs text-[#66716f]">
              Totalt {formatCount(outcomes.totalAttempts)} försök under perioden.
            </p>
          ) : null}
        </ActionShell>
      </div>

      <div className="min-w-0">
        <ActionShell
          title="Utfall och flöde"
          description="Fördelning per slutstatus och per registreringsflöde."
          method="GET"
          endpoint="/api/admin/statistics/verification-outcomes"
        >
          <div className="mt-4">
            <DistributionBarList
              title="Utfall"
              items={outcomes?.outcomes}
              loading={query.isLoading}
              labelFor={(key) => OUTCOME_LABELS[key] ?? key}
              emptyMessage="Inga försök ännu."
            />
          </div>
          <div className="mt-5">
            <DistributionBarList
              title="Flöde"
              items={outcomes?.byFlow}
              loading={query.isLoading}
              labelFor={(key) => FLOW_LABELS[key] ?? key}
              emptyMessage="Inga försök ännu."
            />
          </div>
        </ActionShell>
      </div>
    </div>
  );
}
