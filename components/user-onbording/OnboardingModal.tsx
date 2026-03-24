"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { UpdateUserRequest } from "@/types";

export default function OnboardingModal() {
  const { user, isLoading, updateUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    phone: "",
    city: "",
  });

  useEffect(() => {
    // Vänta tills användaren är laddad
    if (isLoading || !user) return;

    const isStudent = user.accountType === "student";
    
    // Vad saknas?
    // Notera: Vi kollar om fälten är tomma strängar eller null/undefined
    const missingPhone = !user.phone;
    const missingCity = !user.city;
    const missingName = isStudent && (!user.firstName || !user.surname);

    // Om något viktigt saknas, visa modalen
    if (missingPhone || missingCity || missingName) {
      setFormData({
        firstName: isStudent ? (user.firstName || "") : "",
        surname: isStudent ? (user.surname || "") : "",
        phone: user.phone || "",
        // Hantera fall där city kan vara ett objekt {name: "Gbg"} eller sträng
        city: typeof user.city === 'string' ? user.city : (user.city as any)?.name || "",
      });
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [user, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: UpdateUserRequest = {
        phone: formData.phone,
        city: formData.city,
      };

      if (user?.accountType === "student") {
        payload.firstName = formData.firstName;
        payload.surname = formData.surname;
      }

      await updateUser(payload);
      
      // Modalen stängs automatiskt när user uppdateras i context -> useEffect körs -> ser att inget saknas -> stänger
      
    } catch (error) {
      console.error("Kunde inte spara profil", error);
      alert("Något gick fel. Försök igen.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl md:p-10 animate-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Välkommen! 👋</h2>
          <p className="mt-2 text-gray-600">
            För att du ska få ut det mesta av plattformen behöver vi lite mer information om dig.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            {user?.accountType === "student" && (
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

            <Field>
              <FieldLabel>Telefonnummer</FieldLabel>
              <Input 
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="070-123 45 67"
              />
            </Field>

            <Field>
              <FieldLabel>Nuvarande stad</FieldLabel>
              <Input 
                required
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="T.ex. Stockholm"
              />
            </Field>

            <Button type="submit" fullWidth disabled={loading} className="mt-4">
              {loading ? "Sparar..." : "Kom igång"}
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}