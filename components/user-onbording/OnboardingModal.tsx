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
import { authService } from "@/services/auth-service";
import { schoolService } from "@/services/school-service";
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
  const { user, token, isLoading, completeAuth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
    let active = true;

    schoolService
      .list()
      .then((items) => {
        if (active) setSchools(items);
      })
      .catch(() => {
        if (active) setSchools([]);
      });

    return () => {
      active = false;
    };
  }, []);

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
        throw new Error("Kunde inte läsa e-postadress från sessionen.");
      }

      if (
        !formData.firstName.trim() ||
        !formData.surname.trim() ||
        !formData.schoolId ||
        !formData.ssn.trim() ||
        !formData.city.trim()
      ) {
        throw new Error("Fyll i namn, stad, skola och personnummer.");
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
      console.error("Kunde inte spara profil", error);
      setError(error instanceof Error ? error.message : "Något gick fel. Försök igen.");
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
            Slutför studentkonto
          </h2>
          <p className="mt-2 text-gray-600">
            Fyll i de studentuppgifter som saknas för att aktivera kontot.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="onboarding-first-name">Förnamn</FieldLabel>
                <Input
                  id="onboarding-first-name"
                  required
                  value={formData.firstName}
                  onChange={(e) => updateFormData({ firstName: e.target.value })}
                  placeholder="Förnamn"
                  autoComplete="given-name"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="onboarding-surname">Efternamn</FieldLabel>
                <Input
                  id="onboarding-surname"
                  required
                  value={formData.surname}
                  onChange={(e) => updateFormData({ surname: e.target.value })}
                  placeholder="Efternamn"
                  autoComplete="family-name"
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="onboarding-school">Skola</FieldLabel>
              <select
                id="onboarding-school"
                required
                value={formData.schoolId}
                onChange={(e) => updateFormData({ schoolId: e.target.value })}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Välj skola</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {[school.name, school.city].filter(Boolean).join(", ")}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <FieldLabel htmlFor="onboarding-ssn">Personnummer</FieldLabel>
              <Input
                id="onboarding-ssn"
                required
                value={formData.ssn}
                onChange={(e) => updateFormData({ ssn: e.target.value })}
                placeholder="ÅÅÅÅMMDD-XXXX"
                autoComplete="off"
              />
              <FieldDescription>
                Uppgiften skickas till register-student för att slutföra studentkontot.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="onboarding-city">Stad</FieldLabel>
              <Input 
                id="onboarding-city"
                required
                value={formData.city}
                onChange={(e) => updateFormData({ city: e.target.value })}
                placeholder="T.ex. Stockholm"
              />
            </Field>

            {error && <FieldError>{error}</FieldError>}

            <Button type="submit" fullWidth disabled={loading} className="mt-4">
              {loading ? "Skickar..." : "Skicka"}
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
