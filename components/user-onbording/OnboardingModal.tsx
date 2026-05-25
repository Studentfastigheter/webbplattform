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
import { UpdateUserRequest } from "@/types";
import type { School } from "@/types/school";

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

export default function OnboardingModal() {
  const { user, token, isLoading, updateUser, completeAuth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    phone: "",
    city: "",
    schoolId: "",
    ssn: "",
  });

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
    // Vänta tills användaren är laddad
    if (isLoading || !user) return;

    const isStudent = String(user.accountType).toLowerCase() === "student";
    
    // Vad saknas?
    // Notera: Vi kollar om fälten är tomma strängar eller null/undefined
    const missingStudentRegistration = isStudent && !user.schoolId;

    // Visa register-student-modalen först när en inloggad student saknar studentregistrering.
    if (missingStudentRegistration) {
      setFormData({
        firstName: isStudent ? (user.firstName || "") : "",
        surname: isStudent ? (user.surname || "") : "",
        phone: user.phone || "",
        // Hantera fall där city kan vara ett objekt {name: "Gbg"} eller sträng
        city: typeof user.city === 'string' ? user.city : (user.city as any)?.name || "",
        schoolId: user.schoolId ? String(user.schoolId) : "",
        ssn: user.ssn || "",
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
      const isStudent = String(user?.accountType).toLowerCase() === "student";
      const needsStudentRegistration = isStudent && !user?.schoolId;
      const email = user?.email || getJwtSubject(token);

      if (needsStudentRegistration) {
        if (!email) {
          throw new Error("Kunde inte läsa e-postadress från sessionen.");
        }

        if (!formData.schoolId || !formData.ssn.trim() || !formData.city.trim()) {
          throw new Error("Fyll i stad, skola och personnummer.");
        }

        const response = await authService.registerStudent({
          firstName: formData.firstName.trim(),
          surname: formData.surname.trim(),
          email,
          schoolId: Number(formData.schoolId),
          city: formData.city.trim(),
          ssn: formData.ssn.trim(),
        });

        completeAuth(response);
        setIsOpen(false);
        return;
      }

      const payload: UpdateUserRequest = {
        phone: formData.phone,
        city: formData.city,
      };

      if (isStudent) {
        payload.firstName = formData.firstName;
        payload.surname = formData.surname;
      }

      await updateUser(payload);
      
      // Modalen stängs automatiskt när user uppdateras i context -> useEffect körs -> ser att inget saknas -> stänger
      
    } catch (error) {
      console.error("Kunde inte spara profil", error);
      setError(error instanceof Error ? error.message : "Något gick fel. Försök igen.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isStudent = String(user?.accountType).toLowerCase() === "student";
  const needsStudentRegistration = isStudent && !user?.schoolId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg rounded-[8px] bg-white p-6 shadow-2xl md:p-10 animate-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            {needsStudentRegistration ? "Slutför studentkonto" : "Komplettera profil"}
          </h2>
          <p className="mt-2 text-gray-600">
            {needsStudentRegistration
              ? "Fyll i studentuppgifterna för att aktivera kontot."
              : "För att du ska få ut det mesta av plattformen behöver vi lite mer information om dig."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            {isStudent && (
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Förnamn</FieldLabel>
                  <Input 
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="Förnamn"
                  />
                </Field>
                <Field>
                  <FieldLabel>Efternamn</FieldLabel>
                  <Input 
                    required
                    value={formData.surname}
                    onChange={(e) => setFormData({...formData, surname: e.target.value})}
                    placeholder="Efternamn"
                  />
                </Field>
              </div>
            )}

            {needsStudentRegistration && (
              <>
                <Field>
                  <FieldLabel>Skola</FieldLabel>
                  <select
                    required
                    value={formData.schoolId}
                    onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
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
                  <FieldLabel>Personnummer</FieldLabel>
                  <Input
                    required
                    value={formData.ssn}
                    onChange={(e) => setFormData({ ...formData, ssn: e.target.value })}
                    placeholder="ÅÅÅÅMMDD-XXXX"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Uppgiften skickas till register-student för att slutföra studentkontot.
                  </FieldDescription>
                </Field>
              </>
            )}

            <Field>
              <FieldLabel>Telefonnummer</FieldLabel>
              <Input 
                required={!needsStudentRegistration}
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="070-123 45 67"
              />
            </Field>

            <Field>
              <FieldLabel>Stad</FieldLabel>
              <Input 
                required
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="T.ex. Stockholm"
              />
            </Field>

            {error && <FieldError>{error}</FieldError>}

            <Button type="submit" fullWidth disabled={loading} className="mt-4">
              {loading ? "Sparar..." : needsStudentRegistration ? "Slutför konto" : "Kom igång"}
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
