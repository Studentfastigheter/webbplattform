"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import { authService } from "@/features/auth/services/auth-service";
import { schoolService } from "@/features/schools/services/school-service";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import type { User } from "@/types/user";
import type { School } from "@/types/school";

type AuthMeUser = User & Record<string, unknown>;

function getJwtSubject(token: string | null): string {
  if (!token || typeof window === "undefined") return "";

  try {
    const payload = token.split(".")[1];
    if (!payload) return "";

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalized));
    return typeof decoded.sub === "string" ? decoded.sub : "";
  } catch {
    return "";
  }
}

function stringFromAuthMe(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return "";
}

function getCityFromAuthMe(user: AuthMeUser) {
  if (typeof user.city === "string") {
    return user.city.trim();
  }

  if (user.city && typeof user.city === "object") {
    const city = user.city as Record<string, unknown>;
    return stringFromAuthMe(city.name, city.city, city.value);
  }

  return "";
}

export default function OnboardingModal() {
  const { locale } = useI18n();
  const { user, token, isLoading, completeAuth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [schoolsLoaded, setSchoolsLoaded] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    city: "",
    schoolId: "",
    ssn: "",
  });

  const updateFormData = (patch: Partial<typeof formData>) => {
    setFormData((current) => ({ ...current, ...patch }));
  };

  useEffect(() => {
    if (!isOpen || schoolsLoaded) return;

    let active = true;
    setSchoolsLoading(true);

    schoolService
      .list()
      .then((items) => {
        if (active) setSchools(items);
      })
      .catch(() => {
        if (active) setSchools([]);
      })
      .finally(() => {
        if (active) {
          setSchoolsLoaded(true);
          setSchoolsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isOpen, schoolsLoaded]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setIsOpen(false);
      return;
    }

    const accountType = String(user.accountType).toLowerCase();
    const isQuickRegister = accountType === "quick_register";

    if (isQuickRegister) {
      const authMeUser = user as AuthMeUser;

      setFormData({
        firstName: stringFromAuthMe(authMeUser.firstName),
        surname: stringFromAuthMe(authMeUser.surname),
        city: getCityFromAuthMe(authMeUser),
        schoolId: stringFromAuthMe(
          authMeUser.schoolId,
          authMeUser.school_id,
          (authMeUser.school as Record<string, unknown> | undefined)?.id
        ),
        ssn: stringFromAuthMe(authMeUser.ssn),
      });
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [user, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const email = user?.email || getJwtSubject(token);

      if (!email) {
        throw new Error(localizedText(locale, "Kunde inte läsa e-postadress från sessionen.", "Could not read the email address from the session."));
      }

      if (
        !formData.firstName.trim() ||
        !formData.surname.trim() ||
        !formData.schoolId ||
        !formData.ssn.trim() ||
        !formData.city.trim()
      ) {
        throw new Error(localizedText(locale, "Fyll i namn, stad, skola och personnummer.", "Enter name, city, school and personal identity number."));
      }

      const payload = {
        firstName: formData.firstName.trim(),
        surname: formData.surname.trim(),
        email,
        schoolId: Number(formData.schoolId),
        city: formData.city.trim(),
        ssn: formData.ssn.trim(),
      };

      const response = await authService.registerStudent(payload);

      completeAuth(response);
      setIsOpen(false);
    } catch (error) {
      console.error("Could not save profile", error);
      setError(error instanceof Error ? error.message : localizedText(locale, "Något gick fel. Försök igen.", "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg rounded-[8px] bg-white p-6 shadow-2xl md:p-10 animate-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            {localizedText(locale, "Slutför studentkonto", "Complete student account")}
          </h2>
          <p className="mt-2 text-gray-600">
            {localizedText(locale, "Fyll i de studentuppgifter som saknas för att aktivera kontot.", "Enter the missing student details to activate the account.")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="onboarding-first-name">{localizedText(locale, "Förnamn", "First name")}</FieldLabel>
                <Input
                  id="onboarding-first-name"
                  required
                  value={formData.firstName}
                  onChange={(e) => updateFormData({ firstName: e.target.value })}
                  placeholder={localizedText(locale, "Förnamn", "First name")}
                  autoComplete="given-name"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="onboarding-surname">{localizedText(locale, "Efternamn", "Last name")}</FieldLabel>
                <Input
                  id="onboarding-surname"
                  required
                  value={formData.surname}
                  onChange={(e) => updateFormData({ surname: e.target.value })}
                  placeholder={localizedText(locale, "Efternamn", "Last name")}
                  autoComplete="family-name"
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="onboarding-school">{localizedText(locale, "Skola", "School")}</FieldLabel>
              <select
                id="onboarding-school"
                required
                value={formData.schoolId}
                onChange={(e) => updateFormData({ schoolId: e.target.value })}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">
                  {schoolsLoading
                    ? localizedText(locale, "Laddar skolor...", "Loading schools...")
                    : localizedText(locale, "Välj skola", "Choose school")}
                </option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {[school.name, school.city].filter(Boolean).join(", ")}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <FieldLabel htmlFor="onboarding-ssn">{localizedText(locale, "Personnummer", "Personal identity number")}</FieldLabel>
              <Input
                id="onboarding-ssn"
                required
                value={formData.ssn}
                onChange={(e) => updateFormData({ ssn: e.target.value })}
                placeholder="ÅÅÅÅMMDD-XXXX"
                autoComplete="off"
              />
              <FieldDescription>
                {localizedText(locale, "Uppgiften skickas till register-student för att slutföra studentkontot.", "This detail is sent to register-student to complete the student account.")}
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="onboarding-city">{localizedText(locale, "Stad", "City")}</FieldLabel>
              <Input 
                id="onboarding-city"
                required
                value={formData.city}
                onChange={(e) => updateFormData({ city: e.target.value })}
                placeholder={localizedText(locale, "T.ex. Stockholm", "E.g. Stockholm")}
              />
            </Field>

            {error && <FieldError>{error}</FieldError>}

            <Button type="submit" fullWidth disabled={loading} className="mt-4">
              {loading
                ? localizedText(locale, "Skickar...", "Sending...")
                : localizedText(locale, "Skicka", "Submit")}
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
