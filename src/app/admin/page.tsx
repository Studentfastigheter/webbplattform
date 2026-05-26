"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  FileSpreadsheetIcon,
  SchoolIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { schoolService } from "@/features/schools/services/school-service";

type ParsedSchoolRow = {
  id: string;
  rowNumber: number;
  name: string;
  city: string;
  lat: string;
  lng: string;
};

type InvalidSchoolRow = {
  rowNumber: number;
  reason: string;
};

type UploadResult = {
  added: number;
  failed: Array<{ rowNumber: number; name: string; reason: string }>;
};

const headerAliases = {
  name: ["name", "namn", "school", "schoolname", "school_name", "skola", "skolnamn"],
  city: ["city", "stad", "ort"],
  lat: ["lat", "latitude", "latitud"],
  lng: ["lng", "long", "longitude", "longitud", "lon"],
} as const;

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }

  return "";
}

function parseCoordinate(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value.trim().replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

function getCell(row: Record<string, unknown>, aliases: readonly string[], fallbackIndex: number) {
  const normalizedAliases = new Set(aliases.map(normalizeHeader));

  for (const [key, value] of Object.entries(row)) {
    if (normalizedAliases.has(normalizeHeader(key))) {
      return value;
    }
  }

  return Object.values(row)[fallbackIndex];
}

function countDelimiter(line: string, delimiter: string) {
  let count = 0;
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      count += 1;
    }
  }

  return count;
}

function detectDelimiter(text: string) {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim().length > 0) ?? "";
  const delimiters = [",", ";", "\t"] as const;

  return delimiters.reduce((best, delimiter) =>
    countDelimiter(firstLine, delimiter) > countDelimiter(firstLine, best)
      ? delimiter
      : best
  );
}

function parseCsvRows(text: string) {
  const delimiter = detectDelimiter(text);
  const rows: string[][] = [[]];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      rows[rows.length - 1].push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      rows[rows.length - 1].push(field);
      field = "";
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      rows.push([]);
      continue;
    }

    field += char;
  }

  rows[rows.length - 1].push(field);

  return rows
    .map((row) => row.map((cell) => cell.trim()))
    .filter((row) => row.some((cell) => cell.length > 0));
}

function hasKnownHeader(headers: string[]) {
  const knownHeaders = new Set(
    Object.values(headerAliases)
      .flat()
      .map(normalizeHeader)
  );

  return headers.some((header) => knownHeaders.has(normalizeHeader(header)));
}

function csvRowsToRecords(rows: string[][]) {
  const firstRow = rows[0] ?? [];
  const hasHeader = hasKnownHeader(firstRow);
  const headers = hasHeader ? firstRow : ["name", "city", "lat", "lng"];
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const firstDataRowNumber = hasHeader ? 2 : 1;

  return {
    firstDataRowNumber,
    records: dataRows.map((row) =>
      Object.fromEntries(
        headers.map((header, index) => [
          header || `column_${index + 1}`,
          row[index] ?? "",
        ])
      )
    ),
  };
}

function mapRows(rawRows: Record<string, unknown>[], firstDataRowNumber = 2) {
  const rows: ParsedSchoolRow[] = [];

  rawRows.forEach((row, index) => {
    const rowNumber = index + firstDataRowNumber;
    const name = firstText(getCell(row, headerAliases.name, 0));
    const city = firstText(getCell(row, headerAliases.city, 1));
    const lat = firstText(getCell(row, headerAliases.lat, 2));
    const lng = firstText(getCell(row, headerAliases.lng, 3));

    if (!name && !city && !lat && !lng) return;

    rows.push({
      id: `${rowNumber}-${index}-${name}-${city}`,
      rowNumber,
      name,
      city,
      lat,
      lng,
    });
  });

  return rows;
}

async function parseCsvFile(file: File) {
  const text = await file.text();

  if (!text.trim()) {
    throw new Error("CSV-filen innehåller inga rader att importera.");
  }

  const csvRows = parseCsvRows(text);

  if (csvRows.length === 0) {
    throw new Error("CSV-filen innehåller inga rader att importera.");
  }

  const { records, firstDataRowNumber } = csvRowsToRecords(csvRows);

  return mapRows(records, firstDataRowNumber);
}

function validateRow(row: ParsedSchoolRow) {
  const lat = parseCoordinate(row.lat);
  const lng = parseCoordinate(row.lng);

  if (!row.name.trim()) return "Saknar skolnamn.";
  if (!row.city.trim()) return "Saknar stad.";
  if (lat === null || lat < -90 || lat > 90) {
    return "Latitud saknas eller är ogiltig.";
  }
  if (lng === null || lng < -180 || lng > 180) {
    return "Longitud saknas eller är ogiltig.";
  }

  return null;
}

export default function AdminPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedSchoolRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const payloadPreview = useMemo(
    () =>
      rows.map((row) => ({
        name: row.name,
        city: row.city,
        lat: parseCoordinate(row.lat) ?? 0,
        lng: parseCoordinate(row.lng) ?? 0,
      })),
    [rows]
  );

  const invalidRows = useMemo(
    () =>
      rows
        .map((row) => {
          const reason = validateRow(row);
          return reason ? { rowNumber: row.rowNumber, reason } : null;
        })
        .filter((row): row is InvalidSchoolRow => row !== null),
    [rows]
  );

  function updateRow(
    rowId: string,
    field: keyof Pick<ParsedSchoolRow, "name" | "city" | "lat" | "lng">,
    value: string
  ) {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
    setError(null);
    setResult(null);
  }

  function removeRow(rowId: string) {
    setRows((currentRows) => currentRows.filter((row) => row.id !== rowId));
    setError(null);
    setResult(null);
  }

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setRows([]);
    setError(null);
    setResult(null);
    setSubmittedCount(0);
    setIsParsing(true);

    try {
      const parsedRows = await parseCsvFile(file);
      setRows(parsedRows);

      if (parsedRows.length === 0) {
        setError("Filen innehåller inga giltiga skolrader.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte läsa CSV-filen.");
    } finally {
      setIsParsing(false);
    }
  }

  async function submitRows() {
    if (isSubmitting) return;

    setError(null);
    setResult(null);
    setSubmittedCount(0);

    if (rows.length === 0) {
      setError("Ladda upp en CSV-fil med minst en giltig skolrad.");
      return;
    }

    if (invalidRows.length > 0) {
      setError("Fixa de ogiltiga raderna i CSV-filen innan import.");
      return;
    }

    const failed: UploadResult["failed"] = [];
    let added = 0;

    setIsSubmitting(true);
    try {
      for (const row of rows) {
        try {
          const lat = parseCoordinate(row.lat);
          const lng = parseCoordinate(row.lng);
          if (lat === null || lng === null) {
            throw new Error("Raden har ogiltiga koordinater.");
          }

          await schoolService.add({
            name: row.name.trim(),
            city: row.city.trim(),
            lat,
            lng,
          });
          added += 1;
        } catch (err) {
          failed.push({
            rowNumber: row.rowNumber,
            name: row.name,
            reason: err instanceof Error ? err.message : "POST misslyckades.",
          });
        } finally {
          setSubmittedCount((current) => current + 1);
        }
      }

      setResult({ added, failed });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-svh bg-[#f6f7f6] px-4 py-8 text-[#1f2937] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#004225] text-white">
              <SchoolIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-[#476e66]">Admin</p>
              <h1 className="text-2xl font-semibold tracking-normal text-[#111827]">
                Importera skolor
              </h1>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="rounded-[8px] border border-[#dfe7e3] bg-white p-5 shadow-sm sm:p-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={onFileChange}
              disabled={isParsing || isSubmitting}
            />

            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isParsing || isSubmitting}
                className="flex min-h-[132px] w-full flex-col items-center justify-center gap-3 rounded-[8px] border border-dashed border-[#b8c9c1] bg-[#f8fbf9] px-4 text-center transition-colors hover:bg-[#eef5f1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FileSpreadsheetIcon className="h-8 w-8 text-[#004225]" />
                <span className="text-base font-semibold text-[#111827]">
                  {fileName ?? "Ladda upp CSV-fil"}
                </span>
                <span className="text-sm text-[#5f6b6b]">
                  Kolumner: skolnamn, stad, lat, long
                </span>
              </button>

              <Button
                type="button"
                fullWidth
                isLoading={isSubmitting}
                isDisabled={isParsing || rows.length === 0 || invalidRows.length > 0}
                onPress={submitRows}
                className="h-12 rounded-full bg-[#004225] text-base font-semibold text-white shadow-none hover:bg-[#00351e]"
              >
                <UploadIcon className="h-4 w-4" />
                Skicka {rows.length > 0 ? rows.length : ""} rader
              </Button>

              {isSubmitting && (
                <p className="text-sm text-[#5f6b6b]">
                  Skickar {submittedCount} av {rows.length} rader.
                </p>
              )}

              {error && (
                <p className="flex items-start gap-2 rounded-[8px] bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </p>
              )}

              {result && (
                <p className="flex items-start gap-2 rounded-[8px] bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {result.added} skolor lades till
                    {result.failed.length > 0 ? `, ${result.failed.length} misslyckades.` : "."}
                  </span>
                </p>
              )}
            </div>

            {rows.length > 0 && (
              <div className="mt-6 overflow-x-auto rounded-[8px] border border-[#dfe7e3]">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead className="bg-[#f2f2f2] text-[#374151]">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Rad</th>
                      <th className="px-3 py-2 font-semibold">Skola</th>
                      <th className="px-3 py-2 font-semibold">Stad</th>
                      <th className="px-3 py-2 font-semibold">Lat</th>
                      <th className="px-3 py-2 font-semibold">Lng</th>
                      <th className="px-3 py-2 font-semibold">
                        <span className="sr-only">Åtgärd</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const rowError = validateRow(row);

                      return (
                        <tr key={row.id} className="border-t border-[#edf2ef]">
                          <td className="px-3 py-2 text-[#6b7280]">
                            {row.rowNumber}
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={row.name}
                              onChange={(event) =>
                                updateRow(row.id, "name", event.target.value)
                              }
                              disabled={isSubmitting}
                              aria-invalid={rowError === "Saknar skolnamn."}
                              className="h-9 min-w-[220px] rounded-[8px] border-transparent bg-[#f8f8f8] shadow-none focus-visible:border-[#004225] focus-visible:ring-[#004225]/20"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={row.city}
                              onChange={(event) =>
                                updateRow(row.id, "city", event.target.value)
                              }
                              disabled={isSubmitting}
                              aria-invalid={rowError === "Saknar stad."}
                              className="h-9 min-w-[140px] rounded-[8px] border-transparent bg-[#f8f8f8] shadow-none focus-visible:border-[#004225] focus-visible:ring-[#004225]/20"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={row.lat}
                              onChange={(event) =>
                                updateRow(row.id, "lat", event.target.value)
                              }
                              disabled={isSubmitting}
                              aria-invalid={
                                rowError === "Latitud saknas eller är ogiltig."
                              }
                              className="h-9 min-w-[110px] rounded-[8px] border-transparent bg-[#f8f8f8] shadow-none focus-visible:border-[#004225] focus-visible:ring-[#004225]/20"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={row.lng}
                              onChange={(event) =>
                                updateRow(row.id, "lng", event.target.value)
                              }
                              disabled={isSubmitting}
                              aria-invalid={
                                rowError === "Longitud saknas eller är ogiltig."
                              }
                              className="h-9 min-w-[110px] rounded-[8px] border-transparent bg-[#f8f8f8] shadow-none focus-visible:border-[#004225] focus-visible:ring-[#004225]/20"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => removeRow(row.id)}
                              disabled={isSubmitting}
                              className="flex h-9 w-9 items-center justify-center rounded-full text-red-700 transition-colors hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label={`Ta bort rad ${row.rowNumber}`}
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {invalidRows.length > 0 && (
              <div className="mt-4 rounded-[8px] border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <h2 className="font-semibold">Ogiltiga rader</h2>
                <ul className="mt-2 space-y-1">
                  {invalidRows.slice(0, 12).map((row) => (
                    <li key={row.rowNumber}>
                      Rad {row.rowNumber}: {row.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result && result.failed.length > 0 && (
              <div className="mt-4 rounded-[8px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <h2 className="font-semibold">Misslyckade POST-anrop</h2>
                <ul className="mt-2 space-y-1">
                  {result.failed.slice(0, 12).map((row) => (
                    <li key={`${row.rowNumber}-${row.name}`}>
                      Rad {row.rowNumber}, {row.name}: {row.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <aside className="rounded-[8px] border border-[#dfe7e3] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#111827]">Payload-preview</h2>
            <pre className="mt-3 overflow-auto rounded-[8px] bg-[#252525] p-4 text-sm leading-6 text-[#f8fafc]">
              {JSON.stringify(
                payloadPreview.length > 0
                  ? payloadPreview
                  : [{ name: "string", city: "string", lat: 0, lng: 0 }],
                null,
                2
              )}
            </pre>
          </aside>
        </div>
      </div>
    </main>
  );
}
