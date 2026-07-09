"use client";

/**
 * Admin — Areas.
 *
 * Manages the area aliases (/api/cities/area-aliases): each row links a raw
 * area name (as delivered by an external property system, per company) to the
 * city it belongs to. Rows without a city were queued automatically — imported
 * from the external system's area register or surfaced by a listing whose
 * location could not be resolved — and are marked "Behöver åtgärd".
 *
 * Linking an area to a city is authoritative: the backend re-resolves every
 * listing with that area, correcting its city and re-geocoding its coordinates
 * from the listing's own address with the city as a constraint. Aliases carry
 * no coordinates by design.
 *
 * Renders inside the admin shell (see admin/layout.tsx), so this file only
 * provides the <main> content, mirroring AdminToolPage's header.
 */

import { useMemo, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "@/components/icons";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { useCompanies } from "@/features/companies/hooks/useCompanies";
import {
  useAdminAreaAliases,
  useAdminCitySummaries,
  useAdminCreateAreaAlias,
  useAdminDeleteAreaAlias,
  useAdminModifyAreaAlias,
} from "@/features/admin/hooks/useAdmin";
import type { AreaAliasDTO } from "@/features/cities/services/city-service";

const inputClass =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";
const buttonClass =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50";
const ghostButtonClass =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

type CityOption = { code: string; label: string };

function AreaAliasRow({
  alias,
  cityOptions,
  onError,
}: {
  alias: AreaAliasDTO;
  cityOptions: CityOption[];
  onError: (message: string) => void;
}) {
  const modifyAlias = useAdminModifyAreaAlias();
  const deleteAlias = useAdminDeleteAreaAlias();
  const { confirm, confirmDialog } = useConfirmDialog();

  const [cityCode, setCityCode] = useState(alias.cityCode ?? "");

  const handleSave = async () => {
    if (!cityCode) return;
    try {
      await modifyAlias.mutateAsync({
        areaName: alias.areaName,
        companyId: alias.companyId,
        cityCode,
      });
    } catch (err) {
      onError((err as Error)?.message ?? "Kunde inte koppla området.");
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Ta bort områdeskoppling?",
      description: `Kopplingen för "${alias.areaName}" tas bort. Berörda annonser platsupplöses om vid nästa synk.`,
      confirmLabel: "Ta bort",
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteAlias.mutateAsync({
        areaName: alias.areaName,
        companyId: alias.companyId,
      });
    } catch (err) {
      onError((err as Error)?.message ?? "Kunde inte ta bort kopplingen.");
    }
  };

  return (
    <tr>
      <td className="py-2.5 pr-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{alias.areaName}</span>
          {!alias.filled && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              Behöver åtgärd
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">
          {alias.companyName ?? `Företag #${alias.companyId}`}
        </span>
      </td>
      <td className="py-2.5 pr-3">
        <select
          className={cn(inputClass, "h-9 max-w-[220px]")}
          value={cityCode}
          onChange={(event) => setCityCode(event.target.value)}
          aria-label="Stad"
        >
          <option value="">Välj stad…</option>
          {/* Bevara ett sparat värde som inte längre finns i stadslistan */}
          {cityCode &&
            !cityOptions.some((option) => option.code === cityCode) && (
              <option value={cityCode}>{cityCode} (okänd stad)</option>
            )}
          {cityOptions.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      </td>
      <td className="py-2.5 pr-1 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className={ghostButtonClass}
            onClick={handleSave}
            disabled={!cityCode || modifyAlias.isPending}
          >
            {modifyAlias.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Koppla
          </button>
          <button
            type="button"
            className={cn(ghostButtonClass, "text-red-600 hover:bg-red-50")}
            onClick={handleDelete}
            disabled={deleteAlias.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {confirmDialog}
        </div>
      </td>
    </tr>
  );
}

function AreaAliasesSection({ onError }: { onError: (message: string) => void }) {
  const aliases = useAdminAreaAliases();
  const companies = useCompanies();
  const cities = useAdminCitySummaries();
  const createAlias = useAdminCreateAreaAlias();

  const [areaName, setAreaName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [cityCode, setCityCode] = useState("");

  const companyOptions = useMemo(
    () =>
      (companies.data ?? [])
        .map((company) => ({
          id: company.id ?? company.companyId,
          label: company.name ?? company.companyName ?? "",
        }))
        .filter(
          (option): option is { id: number; label: string } =>
            typeof option.id === "number" && option.label.length > 0
        ),
    [companies.data]
  );

  // Backend refererar staden via dess oföränderliga kod (cities.code) —
  // därför select bland befintliga städer istället för fritext.
  const cityOptions = useMemo<CityOption[]>(
    () =>
      (cities.data ?? [])
        .map((city) => {
          const code = (city.code ?? "").trim();
          const name = (city.name ?? "").trim();
          return {
            code,
            label: name && name !== code ? `${name} (${code})` : code,
          };
        })
        .filter((option) => option.code.length > 0)
        .sort((a, b) => a.label.localeCompare(b.label, "sv")),
    [cities.data]
  );

  const unresolvedCount = useMemo(
    () => (aliases.data ?? []).filter((alias) => !alias.filled).length,
    [aliases.data]
  );

  // Obehandlade områden överst, därefter alfabetiskt.
  const sortedAliases = useMemo(
    () =>
      [...(aliases.data ?? [])].sort((a, b) => {
        if (a.filled !== b.filled) return a.filled ? 1 : -1;
        return a.areaName.localeCompare(b.areaName, "sv");
      }),
    [aliases.data]
  );

  const handleCreate = async () => {
    const numericCompanyId = Number(companyId);
    if (!areaName.trim() || !Number.isFinite(numericCompanyId)) return;
    try {
      await createAlias.mutateAsync({
        areaName: areaName.trim(),
        companyId: numericCompanyId,
        cityCode: cityCode || undefined,
      });
      setAreaName("");
      setCompanyId("");
      setCityCode("");
    } catch (err) {
      onError((err as Error)?.message ?? "Kunde inte skapa kopplingen.");
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-950">
          Områden → stad
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Koppla ett områdesnamn (per företag) till staden det ligger i. Staden
          blir facit för alla annonser i området, och deras koordinater
          geokodas om från respektive annons adress inom den staden. Rader
          markerade “Behöver åtgärd” har importerats från fastighetssystemet
          eller skapats när en annons inte kunde platsupplösas.
          {unresolvedCount > 0 && (
            <span className="ml-1 font-semibold text-amber-700">
              {unresolvedCount} väntar på koppling.
            </span>
          )}
        </p>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1.2fr_1fr_auto]">
        <input
          className={inputClass}
          value={areaName}
          onChange={(event) => setAreaName(event.target.value)}
          placeholder="Områdesnamn"
        />
        <select
          className={inputClass}
          value={companyId}
          onChange={(event) => setCompanyId(event.target.value)}
          aria-label="Företag"
        >
          <option value="">Välj företag…</option>
          {companyOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className={inputClass}
          value={cityCode}
          onChange={(event) => setCityCode(event.target.value)}
          aria-label="Stad (valfritt)"
        >
          <option value="">Stad (valfritt)…</option>
          {cityOptions.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={buttonClass}
          onClick={handleCreate}
          disabled={!areaName.trim() || !companyId || createAlias.isPending}
        >
          {createAlias.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Lägg till
        </button>
      </div>

      {aliases.isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : sortedAliases.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">Område / företag</th>
                <th className="py-2 pr-3">Stad</th>
                <th className="py-2 pr-1 text-right">Åtgärd</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedAliases.map((alias) => (
                <AreaAliasRow
                  key={`${alias.companyId}-${alias.areaName}`}
                  alias={alias}
                  cityOptions={cityOptions}
                  onError={onError}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-gray-400">
          Inga områdeskopplingar än.
        </p>
      )}
    </section>
  );
}

export default function AdminAreasPage() {
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="space-y-6 text-gray-800">
      <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-semibold leading-8 text-gray-950">
            Områden
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
            Koppla importerade områden till städer så att annonserna får rätt
            stad och kartposition.
          </p>
        </div>
        <div className="portal-control flex h-10 w-fit shrink-0 items-center gap-2 px-3 text-xs font-semibold text-gray-600">
          <span className="h-2 w-2 rounded-full bg-brand-500" />
          Endast admin
        </div>
      </header>

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>{error}</span>
          <button
            type="button"
            className="shrink-0 font-semibold underline"
            onClick={() => setError(null)}
          >
            Stäng
          </button>
        </div>
      )}

      <AreaAliasesSection onError={setError} />
    </main>
  );
}
