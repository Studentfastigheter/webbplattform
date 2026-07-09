"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import { FileSpreadsheetIcon, Trash2Icon, UploadIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminCitySummaries, useAdminCreateSchool, useAdminCreateSchools, useAdminModifySchool, useAdminSchools } from "@/features/admin/hooks/useAdmin";
import type { AdminAddSchoolRequest } from "@/types";
import {
  type AdminActionState,
  toInputValue,
  parseRequiredNumber,
  parseOptionalNumber,
  type CityOption,
  getCityCodeOptions,
  resolveCityCodeValue,
  useResourceList,
  ResultBlock,
  ActionShell,
  FieldRow,
  FormInput,
  FormSelect,
  SubmitButton,
  schoolId,
  cityCode,
  cityOptionLabel,
} from "../shared";

type SchoolFormState = {
  schoolId?: string;
  schoolName: string;
  city: string;
  lat: string;
  lng: string;
};

const emptySchoolForm: SchoolFormState = {
  schoolId: "",
  schoolName: "",
  city: "",
  lat: "",
  lng: "",
};

type CsvSchoolImportRow = SchoolFormState & {
  id: string;
  rowNumber: number;
};

type CsvColumnIndexes = {
  schoolName: number;
  lat: number;
  lng: number;
  dataStart: number;
};

const CSV_COLUMN_ALIASES = {
  schoolName: ["schoolname", "school", "skolnamn", "skola", "name", "namn"],
  lat: ["lat", "latitude", "latitud", "breddgrad"],
  lng: [
    "lng",
    "lon",
    "long",
    "longitude",
    "longitud",
    "langitud",
    "långitud",
  ],
};

function normalizeCsvHeader(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("sv-SE")
    .replace(/[^a-z0-9]/g, "");
}

function countCsvDelimiter(line: string, delimiter: string) {
  let count = 0;
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && char === delimiter) {
      count += 1;
    }
  }

  return count;
}

function detectCsvDelimiter(headerLine: string) {
  const delimiters = ["\t", ";", ","];
  let bestDelimiter = ",";
  let bestCount = countCsvDelimiter(headerLine, bestDelimiter);

  for (const delimiter of delimiters) {
    const count = countCsvDelimiter(headerLine, delimiter);
    const isPreferredTie =
      count === bestCount &&
      count > 0 &&
      delimiters.indexOf(delimiter) < delimiters.indexOf(bestDelimiter);

    if (count > bestCount || isPreferredTie) {
      bestDelimiter = delimiter;
      bestCount = count;
    }
  }

  return bestDelimiter;
}

function parseCsvText(text: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (char === '"') {
      if (inQuotes && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      row.push(field);
      field = "";
      continue;
    }

    if (!inQuotes && char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    if (!inQuotes && char === "\r") {
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function isBlankCsvRow(row: string[]) {
  return row.every((field) => !field.trim());
}

function findCsvColumnIndex(row: string[], aliases: string[]) {
  const normalizedAliases = new Set(aliases.map(normalizeCsvHeader));
  return row.findIndex((field) => normalizedAliases.has(normalizeCsvHeader(field)));
}

function getCsvColumnIndexes(rows: string[][]): CsvColumnIndexes {
  const header = rows[0] ?? [];
  const schoolName = findCsvColumnIndex(header, CSV_COLUMN_ALIASES.schoolName);
  const lat = findCsvColumnIndex(header, CSV_COLUMN_ALIASES.lat);
  const lng = findCsvColumnIndex(header, CSV_COLUMN_ALIASES.lng);

  if (schoolName >= 0 && lat >= 0 && lng >= 0) {
    return { schoolName, lat, lng, dataStart: 1 };
  }

  const fallbackLat = readCsvCoordinateNumber(header[1]);
  const fallbackLng = readCsvCoordinateNumber(header[2]);

  if (header.length >= 3 && Number.isFinite(fallbackLat) && Number.isFinite(fallbackLng)) {
    return { schoolName: 0, lat: 1, lng: 2, dataStart: 0 };
  }

  throw new Error(
    "CSV-filen behöver kolumner för skolnamn, latitud och longitud."
  );
}

function normalizeCsvCoordinate(value: string | undefined) {
  return (value ?? "").trim().replace(",", ".");
}

function readCsvCoordinateNumber(value: string | undefined) {
  const normalized = normalizeCsvCoordinate(value);
  return normalized ? Number(normalized) : Number.NaN;
}

function createCsvImportRowId(rowNumber: number, index: number) {
  return `school-csv-${Date.now()}-${rowNumber}-${index}`;
}

function parseCsvSchoolRows(text: string): CsvSchoolImportRow[] {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim());
  if (!firstLine) {
    throw new Error("CSV-filen är tom.");
  }

  const rows = parseCsvText(text, detectCsvDelimiter(firstLine)).filter(
    (row) => !isBlankCsvRow(row)
  );
  if (rows.length === 0) {
    throw new Error("CSV-filen är tom.");
  }

  const columns = getCsvColumnIndexes(rows);
  const parsedRows = rows
    .slice(columns.dataStart)
    .map((row, index) => {
      const rowNumber = columns.dataStart + index + 1;
      return {
        id: createCsvImportRowId(rowNumber, index),
        rowNumber,
        schoolId: "",
        schoolName: (row[columns.schoolName] ?? "").replace(/^\uFEFF/, "").trim(),
        city: "",
        lat: normalizeCsvCoordinate(row[columns.lat]),
        lng: normalizeCsvCoordinate(row[columns.lng]),
      };
    })
    .filter((row) => row.schoolName || row.lat || row.lng);

  if (parsedRows.length === 0) {
    throw new Error("CSV-filen innehåller inga skolrader.");
  }

  return parsedRows;
}

function getCsvSchoolRowError(row: CsvSchoolImportRow) {
  const errors: string[] = [];
  if (!row.schoolName.trim()) errors.push("saknar skolnamn");
  if (!row.city.trim()) errors.push("saknar stad");
  if (!Number.isFinite(readCsvCoordinateNumber(row.lat))) {
    errors.push("ogiltig latitud");
  }
  if (!Number.isFinite(readCsvCoordinateNumber(row.lng))) {
    errors.push("ogiltig longitud");
  }
  return errors.join(", ");
}

function buildCsvSchoolPayload(
  row: CsvSchoolImportRow,
  cityOptions: CityOption[]
): AdminAddSchoolRequest {
  return buildSchoolPayload(
    {
      schoolName: row.schoolName,
      city: row.city,
      lat: row.lat,
      lng: row.lng,
    },
    false,
    cityOptions
  );
}

function buildSchoolPayload(
  form: SchoolFormState,
  requireId: boolean,
  cityOptions: CityOption[] = []
): AdminAddSchoolRequest {
  const schoolId = parseOptionalNumber(form.schoolId ?? "");
  if (requireId && !schoolId) {
    throw new Error("Välj en skola eller ange schoolId innan du uppdaterar.");
  }
  const cityCodeValue = resolveCityCodeValue(form.city, cityOptions);
  if (!cityCodeValue) {
    throw new Error("Välj en stad.");
  }

  const selectedCity = cityOptions.find((option) => option.code === cityCodeValue);
  if (!selectedCity) {
    throw new Error("Den valda staden finns inte i stadslistan.");
  }
  const cityName = selectedCity.city.name?.trim() || selectedCity.code;

  return {
    ...(schoolId ? { schoolId } : {}),
    schoolName: form.schoolName.trim(),
    city: cityName,
    cityCode: cityCodeValue,
    lat: parseRequiredNumber(form.lat, "Latitud"),
    lng: parseRequiredNumber(form.lng, "Longitud"),
  };
}

function SchoolFields({
  form,
  onChange,
  includeId,
  cityOptions,
  citiesLoading,
}: {
  form: SchoolFormState;
  onChange: (patch: Partial<SchoolFormState>) => void;
  includeId: boolean;
  cityOptions: CityOption[];
  citiesLoading: boolean;
}) {
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {includeId && (
        <FormInput label="SchoolId" value={form.schoolId ?? ""} onChange={(schoolId) => onChange({ schoolId })} disabled />
      )}
      <FormInput label="Skolnamn" value={form.schoolName} onChange={(schoolName) => onChange({ schoolName })} />
      <FormSelect
        label="Stad"
        value={form.city}
        onChange={(city) => onChange({ city })}
        disabled={citiesLoading || cityOptions.length === 0}
      >
        <option value="">
          {citiesLoading ? "Hämtar städer..." : "Välj stad"}
        </option>
        {cityOptions.map(({ city, code }) => (
          <option key={code} value={code}>
            {cityOptionLabel(city)}
          </option>
        ))}
      </FormSelect>
      <FormInput label="Latitud" value={form.lat} onChange={(lat) => onChange({ lat })} />
      <FormInput label="Longitud" value={form.lng} onChange={(lng) => onChange({ lng })} />
    </div>
  );
}

function SchoolsForm() {
  const { items, state: listState, refresh } = useResourceList(useAdminSchools());
  const { items: cities, state: cityState } = useResourceList(useAdminCitySummaries());
  const modifySchool = useAdminModifySchool();
  const createSchoolMutation = useAdminCreateSchool();
  const createSchoolsMutation = useAdminCreateSchools();
  const [selectedId, setSelectedId] = useState("");
  const [updateState, setUpdateState] = useState<AdminActionState>({ status: "idle" });
  const [createState, setCreateState] = useState<AdminActionState>({ status: "idle" });
  const [importState, setImportState] = useState<AdminActionState>({ status: "idle" });
  const [updateForm, setUpdateForm] = useState<SchoolFormState>(emptySchoolForm);
  const [createForm, setCreateForm] = useState<SchoolFormState>(emptySchoolForm);
  const [importRows, setImportRows] = useState<CsvSchoolImportRow[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [bulkCity, setBulkCity] = useState("");
  const citiesLoading = cityState.status === "loading";
  const updateCityOptions = getCityCodeOptions(cities);
  const createCityOptions = getCityCodeOptions(cities);
  const importCityOptions = getCityCodeOptions(cities);
  const importInvalidCount = importRows.filter(getCsvSchoolRowError).length;
  const importReadyCount = importRows.length - importInvalidCount;

  function selectSchool(id: string) {
    setSelectedId(id);
    const selected = items.find((school) => String(school.id) === id);
    if (!selected) return;
    setUpdateForm({
      schoolId: String(selected.id),
      schoolName: selected.name ?? "",
      city: resolveCityCodeValue(
        selected.cityCode,
        getCityCodeOptions(cities)
      ),
      lat: toInputValue(selected.lat),
      lng: toInputValue(selected.lng),
    });
  }

  async function updateSchool() {
    setUpdateState({ status: "loading", message: "Uppdaterar skola..." });
    try {
      await modifySchool.mutateAsync(buildSchoolPayload(updateForm, true, updateCityOptions));
      setUpdateState({ status: "success", message: "Skolan uppdaterades." });
      await refresh();
    } catch (error) {
      setUpdateState({
        status: "error",
        message: error instanceof Error ? error.message : "Skolan kunde inte sparas.",
      });
    }
  }

  async function createSchool() {
    setCreateState({ status: "loading", message: "Skapar skola..." });
    try {
      await createSchoolMutation.mutateAsync(buildSchoolPayload(createForm, false, createCityOptions));
      setCreateForm(emptySchoolForm);
      setCreateState({ status: "success", message: "Skolan skapades." });
      await refresh();
    } catch (error) {
      setCreateState({
        status: "error",
        message: error instanceof Error ? error.message : "Skolan kunde inte sparas.",
      });
    }
  }

  async function handleCsvFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setImportState({ status: "loading", message: "Läser CSV-fil..." });
    try {
      const rows = parseCsvSchoolRows(await file.text());
      setImportRows(rows);
      setCsvFileName(file.name);
      setBulkCity("");
      setImportState({
        status: "success",
        message: `${rows.length} rader lästes in.`,
      });
    } catch (error) {
      setImportRows([]);
      setCsvFileName("");
      setImportState({
        status: "error",
        message:
          error instanceof Error ? error.message : "CSV-filen kunde inte läsas.",
      });
    } finally {
      input.value = "";
    }
  }

  function updateImportRow(id: string, patch: Partial<CsvSchoolImportRow>) {
    setImportRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  }

  function removeImportRow(id: string) {
    setImportRows((current) => current.filter((row) => row.id !== id));
  }

  function applyBulkCity() {
    const city = resolveCityCodeValue(bulkCity, importCityOptions);
    if (!city) return;
    setImportRows((current) => current.map((row) => ({ ...row, city })));
  }

  function clearImportRows() {
    setImportRows([]);
    setCsvFileName("");
    setBulkCity("");
    setImportState({ status: "idle" });
  }

  async function createImportedSchools() {
    if (importRows.length === 0) {
      setImportState({ status: "error", message: "Läs in minst en CSV-rad." });
      return;
    }

    const rowsWithErrors = importRows.filter(getCsvSchoolRowError);
    if (rowsWithErrors.length > 0) {
      setImportState({
        status: "error",
        message: `Åtgärda ${rowsWithErrors.length} rader innan import.`,
      });
      return;
    }

    const count = importRows.length;
    setImportState({ status: "loading", message: `Skapar ${count} skolor...` });

    try {
      await createSchoolsMutation.mutateAsync(
        importRows.map((row) =>
          buildCsvSchoolPayload(row, getCityCodeOptions(cities))
        )
      );
      setImportRows([]);
      setCsvFileName("");
      setBulkCity("");
      setImportState({ status: "success", message: `${count} skolor skapades.` });
      await refresh();
    } catch (error) {
      setImportState({
        status: "error",
        message:
          error instanceof Error
            ? `${error.message} Vissa rader kan redan ha skapats.`
            : "Importen kunde inte slutföras.",
      });
    }
  }

  return (
    <div className="grid gap-4">
      <ActionShell
        title="Hämta och uppdatera skola"
        description="GET hämtar alla skolor och städer. Välj en skola och uppdatera den med PUT."
        method="GET/PUT"
        endpoint="/api/schools, /api/cities, /api/admin/school"
      >
        <ResultBlock state={listState} />
        <ResultBlock state={cityState} />
        <FormSelect label="Välj befintlig skola" value={selectedId} onChange={selectSchool}>
          <option value="">Välj skola</option>
          {items.map((school) => (
            <option key={school.id} value={school.id}>
              {[school.name, school.city].filter(Boolean).join(" - ")}
            </option>
          ))}
        </FormSelect>
        <SchoolFields
          form={updateForm}
          onChange={(patch) => setUpdateForm((current) => ({ ...current, ...patch }))}
          includeId
          cityOptions={updateCityOptions}
          citiesLoading={citiesLoading}
        />
        <SubmitButton isLoading={updateState.status === "loading"} onPress={updateSchool} disabled={!updateForm.schoolId?.trim()}>
          Uppdatera vald
        </SubmitButton>
        <ResultBlock state={updateState} />
      </ActionShell>

      <ActionShell
        title="Skapa ny skola"
        description="POST är separat och skapar en ny skola. Stad väljs från GET-listan."
        method="POST"
        endpoint="/api/admin/school"
      >
        <ResultBlock state={cityState} />
        <SchoolFields
          form={createForm}
          onChange={(patch) => setCreateForm((current) => ({ ...current, ...patch }))}
          includeId={false}
          cityOptions={createCityOptions}
          citiesLoading={citiesLoading}
        />
        <SubmitButton isLoading={createState.status === "loading"} onPress={createSchool} disabled={!createForm.city.trim()}>
          Skapa
        </SubmitButton>
        <ResultBlock state={createState} />
      </ActionShell>

      <ActionShell
        title="Importera skolor från CSV"
        description="Läser in skolrader och skapar kvarvarande rader via POST."
        method="POST"
        endpoint="/api/admin/school"
      >
        <ResultBlock state={cityState} />
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,320px)]">
          <FieldRow label="CSV-fil">
            <Input
              type="file"
              accept=".csv,text/csv"
              disabled={importState.status === "loading"}
              onChange={handleCsvFileChange}
              className="h-10 rounded-[8px] border-[#dfe7e3] bg-white normal-case tracking-normal text-[#111827] file:mr-3 file:rounded-[6px] file:bg-[#eef5f1] file:px-3 file:text-brand"
            />
          </FieldRow>
          <FormSelect
            label="Stad för alla rader"
            value={bulkCity}
            onChange={setBulkCity}
            disabled={citiesLoading || importCityOptions.length === 0}
          >
            <option value="">
              {citiesLoading ? "Hämtar städer..." : "Välj stad"}
            </option>
            {importCityOptions.map(({ city, code }) => (
              <option key={code} value={code}>
                {cityOptionLabel(city)}
              </option>
            ))}
          </FormSelect>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            isDisabled={!bulkCity.trim() || importRows.length === 0}
            onPress={applyBulkCity}
            className="rounded-[8px] px-3 text-brand"
          >
            Applicera stad på alla
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            isDisabled={importRows.length === 0}
            onPress={clearImportRows}
            className="rounded-[8px] px-3 text-brand"
          >
            Rensa import
          </Button>
          {csvFileName && (
            <span className="inline-flex min-w-0 items-center gap-2 rounded-[8px] border border-[#dfe7e3] bg-[#fbfcfb] px-3 py-1.5 text-sm text-[#36534d]">
              <FileSpreadsheetIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{csvFileName}</span>
            </span>
          )}
        </div>

        {importRows.length > 0 ? (
          <>
            <div className="mt-4 overflow-x-auto rounded-[8px] border border-[#dfe7e3]">
              <table className="w-full min-w-[920px] table-fixed border-collapse text-sm">
                <thead className="bg-[#f3f8f5] text-left text-xs font-semibold uppercase tracking-wide text-[#476e66]">
                  <tr>
                    <th className="w-16 px-3 py-2">Rad</th>
                    <th className="w-[280px] px-3 py-2">Skolnamn</th>
                    <th className="w-[220px] px-3 py-2">Stad</th>
                    <th className="w-28 px-3 py-2">Lat</th>
                    <th className="w-28 px-3 py-2">Long</th>
                    <th className="w-[180px] px-3 py-2">Status</th>
                    <th className="w-20 px-3 py-2 text-right">Ta bort</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dfe7e3]">
                  {importRows.map((row) => {
                    const rowError = getCsvSchoolRowError(row);
                    return (
                      <tr key={row.id} className={rowError ? "bg-red-50/60" : "bg-white"}>
                        <td className="px-3 py-2 font-medium text-[#36534d]">
                          {row.rowNumber}
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            aria-label={`Skolnamn rad ${row.rowNumber}`}
                            value={row.schoolName}
                            disabled={importState.status === "loading"}
                            onChange={(event) =>
                              updateImportRow(row.id, {
                                schoolName: event.target.value,
                              })
                            }
                            className="h-9 rounded-[8px] border-[#dfe7e3] bg-white text-sm text-[#111827]"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            aria-label={`Stad rad ${row.rowNumber}`}
                            value={row.city}
                            disabled={
                              citiesLoading ||
                              importCityOptions.length === 0 ||
                              importState.status === "loading"
                            }
                            onChange={(event) =>
                              updateImportRow(row.id, { city: event.target.value })
                            }
                            className="h-9 w-full rounded-[8px] border border-[#dfe7e3] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
                          >
                            <option value="">
                              {citiesLoading ? "Hämtar..." : "Välj stad"}
                            </option>
                            {importCityOptions.map(({ city, code }) => (
                              <option key={code} value={code}>
                                {cityOptionLabel(city)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            aria-label={`Latitud rad ${row.rowNumber}`}
                            value={row.lat}
                            disabled={importState.status === "loading"}
                            onChange={(event) =>
                              updateImportRow(row.id, { lat: event.target.value })
                            }
                            className="h-9 rounded-[8px] border-[#dfe7e3] bg-white text-sm text-[#111827]"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            aria-label={`Longitud rad ${row.rowNumber}`}
                            value={row.lng}
                            disabled={importState.status === "loading"}
                            onChange={(event) =>
                              updateImportRow(row.id, { lng: event.target.value })
                            }
                            className="h-9 rounded-[8px] border-[#dfe7e3] bg-white text-sm text-[#111827]"
                          />
                        </td>
                        <td className="px-3 py-2 text-xs text-[#66716f]">
                          {rowError || "Klar"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            isDisabled={importState.status === "loading"}
                            onPress={() => removeImportRow(row.id)}
                            className="min-w-0 rounded-[8px] text-red-600 hover:bg-red-50"
                          >
                            <Trash2Icon className="h-4 w-4" />
                            <span className="sr-only">Ta bort rad</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#66716f]">
                {importReadyCount} klara av {importRows.length} rader
              </p>
              <Button
                type="button"
                isLoading={importState.status === "loading"}
                isDisabled={
                  importRows.length === 0 ||
                  importInvalidCount > 0 ||
                  importState.status === "loading"
                }
                onPress={() => void createImportedSchools()}
                className="rounded-[8px] bg-brand text-white hover:bg-[#00351e]"
              >
                <UploadIcon className="h-4 w-4" />
                Skapa {importRows.length} skolor
              </Button>
            </div>
          </>
        ) : (
          <div className="mt-4 flex items-center gap-2 rounded-[8px] border border-dashed border-[#c8d8d1] bg-[#fbfcfb] px-4 py-3 text-sm text-[#66716f]">
            <FileSpreadsheetIcon className="h-4 w-4 shrink-0" />
            <span>Ingen CSV inläst.</span>
          </div>
        )}

        <ResultBlock state={importState} />
      </ActionShell>
    </div>
  );
}

export default SchoolsForm;
