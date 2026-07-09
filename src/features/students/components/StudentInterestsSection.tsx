"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useCitiesList } from "@/features/cities/hooks/useCities";
import { schoolService } from "@/features/schools/services/school-service";
import {
  studentInterestsService,
  type StudentInterests,
} from "@/features/students/services/student-interests-service";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import { cn } from "@/lib/utils";

const interestsQueryKey = (locale: string) => ["students", "me", "interests", locale];

/**
 * Lets a student pick the curated cities and schools they are interested in
 * studying in/at. Replaces the retired single home city/school on the profile.
 */
export default function StudentInterestsSection() {
  const { locale } = useI18n();
  const queryClient = useQueryClient();

  const interestsQuery = useQuery<StudentInterests>({
    queryKey: interestsQueryKey(locale),
    queryFn: ({ signal }) => studentInterestsService.get({ signal }),
  });
  const citiesQuery = useCitiesList();
  const schoolsQuery = useQuery({
    queryKey: ["schools", "list", locale],
    queryFn: () => schoolService.list(),
    staleTime: 5 * 60_000,
  });

  const [selectedCityCodes, setSelectedCityCodes] = useState<Set<string>>(new Set());
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<Set<number>>(new Set());
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!interestsQuery.data || dirty) return;
    setSelectedCityCodes(new Set(interestsQuery.data.cities.map((city) => city.code)));
    setSelectedSchoolIds(new Set(interestsQuery.data.schools.map((school) => school.id)));
  }, [interestsQuery.data, dirty]);

  const saveMutation = useMutation({
    mutationFn: () =>
      studentInterestsService.update({
        cityCodes: Array.from(selectedCityCodes),
        schoolIds: Array.from(selectedSchoolIds),
      }),
    onSuccess: (interests) => {
      queryClient.setQueryData(interestsQueryKey(locale), interests);
      setDirty(false);
    },
  });

  const cities = useMemo(
    () =>
      (citiesQuery.data ?? [])
        .filter((city) => Boolean(city.code))
        .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "sv-SE")),
    [citiesQuery.data]
  );
  const schools = useMemo(
    () =>
      (schoolsQuery.data ?? [])
        .filter((school) => typeof school.id === "number" && Boolean(school.name))
        .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "sv-SE")),
    [schoolsQuery.data]
  );

  const toggleCity = (code: string) => {
    setDirty(true);
    setSelectedCityCodes((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleSchool = (id: number) => {
    setDirty(true);
    setSelectedSchoolIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const chipClass = (selected: boolean) =>
    cn(
      "rounded-full border px-3 py-1.5 text-sm font-medium transition",
      selected
        ? "border-brand bg-brand/10 text-brand"
        : "border-gray-200 bg-white text-gray-600 hover:border-brand/40 hover:text-brand"
    );

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900">
        {localizedText(locale, "Mina intressen", "My interests")}
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        {localizedText(
          locale,
          "Välj de studentstäder och skolor du är intresserad av att plugga i eller på.",
          "Pick the student cities and schools you are interested in studying in or at."
        )}
      </p>

      {interestsQuery.isError && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {localizedText(locale, "Kunde inte ladda dina intressen.", "Could not load your interests.")}
        </p>
      )}

      <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {localizedText(locale, "Städer", "Cities")}
      </h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {cities.map((city) => (
          <button
            key={city.code}
            type="button"
            onClick={() => toggleCity(city.code!)}
            className={chipClass(selectedCityCodes.has(city.code!))}
          >
            {city.name}
          </button>
        ))}
        {citiesQuery.isLoading && (
          <span className="text-sm text-gray-400">
            {localizedText(locale, "Laddar städer...", "Loading cities...")}
          </span>
        )}
      </div>

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {localizedText(locale, "Skolor", "Schools")}
      </h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {schools.map((school) => (
          <button
            key={school.id}
            type="button"
            onClick={() => toggleSchool(school.id as number)}
            className={chipClass(selectedSchoolIds.has(school.id as number))}
          >
            {school.name}
          </button>
        ))}
        {schoolsQuery.isLoading && (
          <span className="text-sm text-gray-400">
            {localizedText(locale, "Laddar skolor...", "Loading schools...")}
          </span>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button
          type="button"
          disabled={!dirty || saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending
            ? localizedText(locale, "Sparar...", "Saving...")
            : localizedText(locale, "Spara intressen", "Save interests")}
        </Button>
        {saveMutation.isSuccess && !dirty && (
          <span className="text-sm text-emerald-700">
            {localizedText(locale, "Sparat!", "Saved!")}
          </span>
        )}
        {saveMutation.isError && (
          <span className="text-sm text-red-700">
            {localizedText(locale, "Kunde inte spara.", "Could not save.")}
          </span>
        )}
      </div>
    </section>
  );
}
