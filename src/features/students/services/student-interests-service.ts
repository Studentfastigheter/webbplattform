import { apiClient, type ServiceOptions } from "@/lib/api/client";
import { firstFiniteNumber, firstNonEmptyString, isRecord } from "@/lib/api/normalize";
import { arrayFromApiResponse } from "@/lib/api/client";
import type { CityRef } from "@/types/city";

/**
 * The student's saved interests: curated cities and schools they are
 * interested in studying in/at (replaces the retired home city/school).
 * City names arrive localized by the backend via Accept-Language.
 */
export type StudentInterestSchool = {
  id: number;
  name: string;
};

export type StudentInterests = {
  cities: CityRef[];
  schools: StudentInterestSchool[];
};

export type UpdateStudentInterestsRequest = {
  /** Null leaves the city interests unchanged; an empty array clears them. */
  cityCodes?: string[] | null;
  /** Null leaves the school interests unchanged; an empty array clears them. */
  schoolIds?: number[] | null;
};

const normalizeInterests = (value: unknown): StudentInterests => {
  if (!isRecord(value)) {
    return { cities: [], schools: [] };
  }

  const cities = arrayFromApiResponse<unknown>(value.cities)
    .map((city) => {
      if (!isRecord(city)) return null;
      const code = firstNonEmptyString(city.code);
      if (!code) return null;
      return { code, name: firstNonEmptyString(city.name) ?? code };
    })
    .filter((city): city is CityRef => city !== null);

  const schools = arrayFromApiResponse<unknown>(value.schools)
    .map((school) => {
      if (!isRecord(school)) return null;
      const id = firstFiniteNumber(school.id);
      const name = firstNonEmptyString(school.name);
      if (id === undefined || !name) return null;
      return { id, name };
    })
    .filter((school): school is StudentInterestSchool => school !== null);

  return { cities, schools };
};

export const studentInterestsService = {
  get: async (options?: ServiceOptions): Promise<StudentInterests> => {
    const interests = await apiClient<unknown>("/students/me/interests", {
      signal: options?.signal,
    });
    return normalizeInterests(interests);
  },

  update: async (payload: UpdateStudentInterestsRequest): Promise<StudentInterests> => {
    const interests = await apiClient<unknown>("/students/me/interests", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return normalizeInterests(interests);
  },
};
