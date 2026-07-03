"use client";

/**
 * Admin — Areas.
 *
 * Wires the CityController admin-only geo endpoints that had no frontend:
 *  - Area-to-city mappings   (/api/cities/area-mappings)      — group a
 *    sub-city area under a parent city.
 *  - Area-to-location overrides (/api/cities/area-locations)  — resolve a raw
 *    area name (per company) to a concrete city + coordinates. Rows created
 *    automatically when geocoding fails start as "needs action" (filled=false).
 *
 * Renders inside the admin shell (see admin/layout.tsx), so this file only
 * provides the <main> content, mirroring AdminToolPage's header.
 */

import { useMemo, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useCompanies } from "@/features/companies/hooks/useCompanies";
import {
  useAdminAreaLocations,
  useAdminAreaMappings,
  useAdminCitySummaries,
  useAdminCreateAreaLocation,
  useAdminCreateAreaMapping,
  useAdminDeleteAreaLocation,
  useAdminDeleteAreaMapping,
  useAdminModifyAreaLocation,
  useAdminModifyAreaMapping,
} from "@/features/admin/hooks/useAdmin";
import type { AreaToLocationDTO } from "@/features/cities/services/city-service";

const inputClass =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";
const buttonClass =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50";
const ghostButtonClass =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

function toNumberOrUndefined(value: string): number | undefined {
  const trimmed = value.trim().replace(",", ".");
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-950">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

// --- Area-to-city mappings ---------------------------------------------------

function AreaMappingsSection({ onError }: { onError: (message: string) => void }) {
  const mappings = useAdminAreaMappings();
  const cities = useAdminCitySummaries();
  const createMapping = useAdminCreateAreaMapping();
  const modifyMapping = useAdminModifyAreaMapping();
  const deleteMapping = useAdminDeleteAreaMapping();

  const [areaCode, setAreaCode] = useState("");
  const [parentCityCode, setParentCityCode] = useState("");

  const cityOptions = useMemo(
    () =>
      (cities.data ?? [])
        .map((city) => ({
          code: (city.code ?? "").trim(),
          label: city.city ?? city.code ?? "",
        }))
        .filter((option) => option.code.length > 0),
    [cities.data]
  );

  const handleCreate = async () => {
    if (!areaCode || !parentCityCode) return;
    try {
      await createMapping.mutateAsync({ areaCode, parentCityCode });
      setAreaCode("");
      setParentCityCode("");
    } catch (err) {
      onError((err as Error)?.message ?? "Kunde inte skapa mappningen.");
    }
  };

  const handleModifyParent = async (id: string, nextParentCityCode: string) => {
    try {
      await modifyMapping.mutateAsync({
        id,
        payload: { parentCityCode: nextParentCityCode },
      });
    } catch (err) {
      onError((err as Error)?.message ?? "Kunde inte ändra mappningen.");
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Ta bort mappningen för "${label}"?`)) return;
    try {
      await deleteMapping.mutateAsync(id);
    } catch (err) {
      onError((err as Error)?.message ?? "Kunde inte ta bort mappningen.");
    }
  };

  return (
    <SectionCard
      title="Områden → stad"
      description="Koppla ett delområde (egen stadskod) till den stad det tillhör, så att annonser i området grupperas under rätt stad."
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <select
          className={inputClass}
          value={areaCode}
          onChange={(event) => setAreaCode(event.target.value)}
          aria-label="Områdeskod"
        >
          <option value="">Välj område…</option>
          {cityOptions.map((option) => (
            <option key={`area-${option.code}`} value={option.code}>
              {option.label} ({option.code})
            </option>
          ))}
        </select>
        <select
          className={inputClass}
          value={parentCityCode}
          onChange={(event) => setParentCityCode(event.target.value)}
          aria-label="Moderstad"
        >
          <option value="">Välj moderstad…</option>
          {cityOptions.map((option) => (
            <option key={`parent-${option.code}`} value={option.code}>
              {option.label} ({option.code})
            </option>
          ))}
        </select>
        <button
          type="button"
          className={buttonClass}
          onClick={handleCreate}
          disabled={!areaCode || !parentCityCode || createMapping.isPending}
        >
          {createMapping.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Lägg till
        </button>
      </div>

      {mappings.isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : mappings.data && mappings.data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">Område</th>
                <th className="py-2 pr-3">Moderstad</th>
                <th className="py-2 pr-3 text-right">Åtgärd</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mappings.data.map((mapping) => (
                <tr key={mapping.id}>
                  <td className="py-2.5 pr-3">
                    <span className="font-medium text-gray-900">
                      {mapping.areaName ?? mapping.areaCode}
                    </span>
                    <span className="ml-1 text-xs text-gray-400">
                      {mapping.areaCode}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <select
                      className={cn(inputClass, "h-9 max-w-[220px]")}
                      value={mapping.parentCityCode}
                      onChange={(event) =>
                        handleModifyParent(mapping.id, event.target.value)
                      }
                      disabled={modifyMapping.isPending}
                    >
                      {cityOptions.map((option) => (
                        <option
                          key={`${mapping.id}-${option.code}`}
                          value={option.code}
                        >
                          {option.label} ({option.code})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 pr-1 text-right">
                    <button
                      type="button"
                      className={cn(ghostButtonClass, "text-red-600 hover:bg-red-50")}
                      onClick={() =>
                        handleDelete(
                          mapping.id,
                          mapping.areaName ?? mapping.areaCode
                        )
                      }
                      disabled={deleteMapping.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                      Ta bort
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-gray-400">
          Inga områdesmappningar än.
        </p>
      )}
    </SectionCard>
  );
}

// --- Area-to-location overrides ----------------------------------------------

function AreaLocationRow({
  location,
  onError,
}: {
  location: AreaToLocationDTO;
  onError: (message: string) => void;
}) {
  const modifyLocation = useAdminModifyAreaLocation();
  const deleteLocation = useAdminDeleteAreaLocation();

  const [city, setCity] = useState(location.city ?? "");
  const [lat, setLat] = useState(location.lat != null ? String(location.lat) : "");
  const [lng, setLng] = useState(location.lng != null ? String(location.lng) : "");

  const handleSave = async () => {
    try {
      await modifyLocation.mutateAsync({
        areaName: location.areaName,
        companyId: location.companyId,
        city: city.trim() || undefined,
        lat: toNumberOrUndefined(lat),
        lng: toNumberOrUndefined(lng),
      });
    } catch (err) {
      onError((err as Error)?.message ?? "Kunde inte spara platsen.");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Ta bort platsen för "${location.areaName}"?`)) return;
    try {
      await deleteLocation.mutateAsync({
        areaName: location.areaName,
        companyId: location.companyId,
      });
    } catch (err) {
      onError((err as Error)?.message ?? "Kunde inte ta bort platsen.");
    }
  };

  return (
    <tr>
      <td className="py-2.5 pr-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{location.areaName}</span>
          {!location.filled && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              Behöver åtgärd
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">
          {location.companyName ?? `Företag #${location.companyId}`}
        </span>
      </td>
      <td className="py-2.5 pr-3">
        <input
          className={cn(inputClass, "h-9 max-w-[180px]")}
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Stad"
        />
      </td>
      <td className="py-2.5 pr-3">
        <input
          className={cn(inputClass, "h-9 max-w-[110px]")}
          value={lat}
          onChange={(event) => setLat(event.target.value)}
          placeholder="Lat"
          inputMode="decimal"
        />
      </td>
      <td className="py-2.5 pr-3">
        <input
          className={cn(inputClass, "h-9 max-w-[110px]")}
          value={lng}
          onChange={(event) => setLng(event.target.value)}
          placeholder="Lng"
          inputMode="decimal"
        />
      </td>
      <td className="py-2.5 pr-1 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className={ghostButtonClass}
            onClick={handleSave}
            disabled={modifyLocation.isPending}
          >
            {modifyLocation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Spara
          </button>
          <button
            type="button"
            className={cn(ghostButtonClass, "text-red-600 hover:bg-red-50")}
            onClick={handleDelete}
            disabled={deleteLocation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function AreaLocationsSection({ onError }: { onError: (message: string) => void }) {
  const locations = useAdminAreaLocations();
  const companies = useCompanies();
  const createLocation = useAdminCreateAreaLocation();

  const [areaName, setAreaName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [city, setCity] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

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

  const handleCreate = async () => {
    const numericCompanyId = Number(companyId);
    if (!areaName.trim() || !Number.isFinite(numericCompanyId)) return;
    try {
      await createLocation.mutateAsync({
        areaName: areaName.trim(),
        companyId: numericCompanyId,
        city: city.trim() || undefined,
        lat: toNumberOrUndefined(lat),
        lng: toNumberOrUndefined(lng),
      });
      setAreaName("");
      setCompanyId("");
      setCity("");
      setLat("");
      setLng("");
    } catch (err) {
      onError((err as Error)?.message ?? "Kunde inte skapa platsen.");
    }
  };

  return (
    <SectionCard
      title="Områden → plats"
      description="Lös upp ett råområdesnamn (per företag) till en konkret stad och koordinater. Rader markerade “Behöver åtgärd” skapades automatiskt när geokodningen misslyckades."
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1fr_0.8fr_0.8fr_auto]">
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
        <input
          className={inputClass}
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Stad (valfritt)"
        />
        <input
          className={inputClass}
          value={lat}
          onChange={(event) => setLat(event.target.value)}
          placeholder="Lat"
          inputMode="decimal"
        />
        <input
          className={inputClass}
          value={lng}
          onChange={(event) => setLng(event.target.value)}
          placeholder="Lng"
          inputMode="decimal"
        />
        <button
          type="button"
          className={buttonClass}
          onClick={handleCreate}
          disabled={
            !areaName.trim() || !companyId || createLocation.isPending
          }
        >
          {createLocation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Lägg till
        </button>
      </div>

      {locations.isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : locations.data && locations.data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">Område / företag</th>
                <th className="py-2 pr-3">Stad</th>
                <th className="py-2 pr-3">Lat</th>
                <th className="py-2 pr-3">Lng</th>
                <th className="py-2 pr-1 text-right">Åtgärd</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {locations.data.map((location) => (
                <AreaLocationRow
                  key={`${location.companyId}-${location.areaName}`}
                  location={location}
                  onError={onError}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-gray-400">
          Inga platsöverstyrningar än.
        </p>
      )}
    </SectionCard>
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
            Hantera hur områden grupperas under städer och lös upp
            områdesnamn till platser för importerade annonser.
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

      <div className="flex flex-col gap-5">
        <AreaMappingsSection onError={setError} />
        <AreaLocationsSection onError={setError} />
      </div>
    </main>
  );
}
