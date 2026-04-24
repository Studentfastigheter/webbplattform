"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QueueHero from "@/components/ads/QueueHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { queueService, type CompanyDTO } from "@/services/queue-service";
import { type HousingQueueDTO } from "@/types/queue";
import { Loader2, Save } from "lucide-react";
import { UploadButton } from "../../_components/UploadButton";

const DRAFT_STORAGE_PREFIX = "portal-company-profile-draft-v1";

type ProfileDraft = {
  companyId: number;
  name: string;
  subtitle: string;
  description: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl: string;
  bannerUrl: string;
  facebook: string;
  linkedin: string;
};

type StoredProfileDraft = {
  fields: ProfileDraft;
};

function buildInitialDraft(
  companyId: number,
  companyData: CompanyDTO,
  firstQueue: HousingQueueDTO | undefined
): ProfileDraft {
  return {
    companyId,
    name: companyData.name || "Företag",
    subtitle: companyData.subtitle || "",
    description: companyData.description || "",
    website: companyData.website || "",
    contactEmail: firstQueue?.contactEmail ?? "",
    contactPhone: firstQueue?.contactPhone ?? "",
    logoUrl: companyData.logoUrl || "/logos/campuslyan-logo.svg",
    bannerUrl: companyData.bannerUrl || "/appartment.jpg",
    facebook: firstQueue?.socialLinks?.facebook ?? "",
    linkedin: firstQueue?.socialLinks?.linkedin ?? "",
  };
}

export default function ProfilePage() {
  const { user, isLoading: authLoading, updateUser } = useAuth();
  const previewImageUrlsRef = useRef<{
    logoUrl: string | null;
    bannerUrl: string | null;
  }>({
    logoUrl: null,
    bannerUrl: null,
  });

  const [company, setCompany] = useState<CompanyDTO | null>(null);
  const [companyQueue, setCompanyQueue] = useState<HousingQueueDTO | null>(null);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState(false);

  const companyId = getActiveCompanyId(user);

  useEffect(() => {
    return () => {
      const previewImageUrls = previewImageUrlsRef.current;
      if (previewImageUrls.logoUrl) {
        URL.revokeObjectURL(previewImageUrls.logoUrl);
      }
      if (previewImageUrls.bannerUrl) {
        URL.revokeObjectURL(previewImageUrls.bannerUrl);
      }
    };
  }, []);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    if (companyId == null || Number.isNaN(companyId)) {
      setError("Ogiltigt företags-ID.");
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([
      queueService.getCompany(companyId),
      queueService.getByCompany(companyId),
    ])
      .then(([companyData, companyQueues]) => {
        if (!active) return;

        const normalizedQueues = Array.isArray(companyQueues) ? companyQueues : [];
        const firstQueue = normalizedQueues[0];
        const storageKey = `${DRAFT_STORAGE_PREFIX}-${companyId}`;

        const initialDraft = buildInitialDraft(companyId, companyData, firstQueue);

        let nextDraft = initialDraft;

        if (typeof window !== "undefined") {
          const rawStored = localStorage.getItem(storageKey);
          if (rawStored) {
            try {
              const parsed = JSON.parse(rawStored) as StoredProfileDraft;
              if (parsed?.fields) {
                nextDraft = {
                  ...initialDraft,
                  ...parsed.fields,
                  companyId,
                };
              }
            } catch {
              // Ignore invalid local draft payload.
            }
          }
        }

        setCompany(companyData);
        setCompanyQueue(firstQueue ?? null);
        setDraft(nextDraft);
      })
      .catch((fetchError) => {
        if (!active) return;

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Kunde inte ladda företagsprofilen."
        );
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, companyId, user]);

  const heroQueue = useMemo(() => {
    if (!draft) return null;

    const facebook = draft.facebook.trim();
    const linkedin = draft.linkedin.trim();

    return {
      id: String(company?.id ?? draft.companyId),
      companyId: company?.id ?? draft.companyId,
      name: draft.name || company?.name || "Företag",
      city: "",
      logoUrl: draft.logoUrl || company?.logoUrl || "/logos/campuslyan-logo.svg",
      bannerUrl: draft.bannerUrl || company?.bannerUrl || "/appartment.jpg",
      description: draft.description || company?.description,
      website: draft.website || company?.website,
      activeListings: 0,
      totalUnits: companyQueue?.totalUnits,
      waitDays: companyQueue?.waitDays,
      contactEmail: draft.contactEmail || undefined,
      contactPhone: draft.contactPhone || undefined,
      socialLinks:
        facebook || linkedin
          ? {
              facebook: facebook || undefined,
              linkedin: linkedin || undefined,
            }
          : undefined,
    } satisfies HousingQueueDTO;
  }, [company, companyQueue, draft]);

  const updateDraftField = <K extends keyof ProfileDraft>(
    key: K,
    value: ProfileDraft[K]
  ) => {
    setDraft((current) => {
      if (!current) return current;
      return { ...current, [key]: value };
    });
    setSaveMessage(null);
  };

  const handleSave = async () => {
    if (!draft || companyId == null) return;

    setSaving(true);
    setSaveMessage(null);
    setSaveWarning(false);

    try {
      const storageKey = `${DRAFT_STORAGE_PREFIX}-${companyId}`;
      const payload: StoredProfileDraft = {
        fields: {
          ...draft,
          // Blob URLs are not useful after a page reload.
          logoUrl: draft.logoUrl.startsWith("blob:") ? "/logos/campuslyan-logo.svg" : draft.logoUrl,
          bannerUrl: draft.bannerUrl.startsWith("blob:") ? "/appartment.jpg" : draft.bannerUrl,
        },
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, JSON.stringify(payload));
      }

      try {
        await updateUser({
          description: draft.description.trim() || undefined,
          phone: draft.contactPhone.trim() || undefined,
        });
        setSaveMessage("Profilen sparades.");
      } catch (backendError) {
        const backendMessage =
          backendError instanceof Error
            ? backendError.message
            : "Kunde inte spara till backend.";

        setSaveWarning(true);
        setSaveMessage(`Utkast sparat lokalt. ${backendMessage}`);
      }
    } catch (storageError) {
      const storageMessage =
        storageError instanceof Error
          ? storageError.message
          : "Kunde inte spara utkastet.";
      setSaveWarning(true);
      setSaveMessage(storageMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (
    field: "logoUrl" | "bannerUrl",
    file: File
  ) => {
    const previousPreview = previewImageUrlsRef.current[field];
    if (previousPreview) {
      URL.revokeObjectURL(previousPreview);
    }

    const localPreviewUrl = URL.createObjectURL(file);
    previewImageUrlsRef.current[field] = localPreviewUrl;
    updateDraftField(field, localPreviewUrl);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Laddar profil...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Logga in för att hantera företagsprofilen.
      </div>
    );
  }

  if (companyId == null) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Denna profilsida gäller bara för företagskonton.
      </div>
    );
  }

  if (loading || !draft || !heroQueue) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Hämtar företagsprofil...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">Företagsprofil</h1>
        <p className="text-sm text-gray-600">
          Redigera fälten och förhandsgranska exakt hur profilen visas på
          sidan för alla köer.
        </p>
        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {saveMessage && (
          <p
            className={`rounded-md border px-3 py-2 text-sm ${
              saveWarning
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {saveMessage}
          </p>
        )}
      </header>

      <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">
        <Card className="h-fit border-gray-200 bg-white xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>Redigera profil</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="profile-name">Profilnamn</Label>
              <Input
                id="profile-name"
                value={draft.name}
                onChange={(event) =>
                  updateDraftField("name", event.target.value)
                }
                placeholder="Ange företagsnamn"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="profile-subtitle">Underrubrik</Label>
              <Input
                id="profile-subtitle"
                value={draft.subtitle}
                onChange={(event) =>
                  updateDraftField("subtitle", event.target.value)
                }
                placeholder="Kort beskrivning av företaget"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="profile-description">Om oss</Label>
              <Textarea
                id="profile-description"
                value={draft.description}
                onChange={(event) =>
                  updateDraftField("description", event.target.value)
                }
                placeholder="Beskriv företaget"
                rows={5}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="profile-website">Hemsida</Label>
              <Input
                id="profile-website"
                value={draft.website}
                onChange={(event) =>
                  updateDraftField("website", event.target.value)
                }
                placeholder="https://"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="profile-email">Kontakt e-post</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={draft.contactEmail}
                  onChange={(event) =>
                    updateDraftField("contactEmail", event.target.value)
                  }
                  placeholder="kontakt@företag.se"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="profile-phone">Kontakt telefon</Label>
                <Input
                  id="profile-phone"
                  value={draft.contactPhone}
                  onChange={(event) =>
                    updateDraftField("contactPhone", event.target.value)
                  }
                  placeholder="070-000 00 00"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="profile-facebook">Facebook</Label>
                <Input
                  id="profile-facebook"
                  value={draft.facebook}
                  onChange={(event) =>
                    updateDraftField("facebook", event.target.value)
                  }
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="profile-linkedin">LinkedIn</Label>
                <Input
                  id="profile-linkedin"
                  value={draft.linkedin}
                  onChange={(event) =>
                    updateDraftField("linkedin", event.target.value)
                  }
                  placeholder="https://linkedin.com/company/..."
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Bilder</Label>
              <div className="flex flex-wrap gap-3">
                <UploadButton
                  variant="outline"
                  size="sm"
                  onFileSelect={(file) => handleImageSelect("logoUrl", file)}
                >
                  Byt logga
                </UploadButton>

                <UploadButton
                  variant="outline"
                  size="sm"
                  onFileSelect={(file) => handleImageSelect("bannerUrl", file)}
                >
                  Byt omslagsbild
                </UploadButton>
              </div>
            </div>

            <Button onClick={handleSave} isLoading={saving}>
              {!saving && <Save className="h-4 w-4" />}
              Spara profil
            </Button>
          </CardContent>
        </Card>

        <section className="h-fit rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
          <main className="overflow-hidden rounded-xl bg-white pb-8">
            <QueueHero
              queue={heroQueue}
              disableShareButton
            />

            <div className="mx-auto mt-10 max-w-4xl px-4 pb-16 sm:px-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Bostadskö
              </h2>

              {companyQueue ? (
                <article className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-gray-900">
                        {companyQueue.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {companyQueue.city || "Stad saknas"}
                        {companyQueue.waitDays != null &&
                          ` | ca ${companyQueue.waitDays} dagars kötid`}
                        {companyQueue.totalUnits != null &&
                          ` | ${companyQueue.totalUnits} bostäder`}
                      </p>
                    </div>
                  </div>

                  {companyQueue.description && (
                    <p className="mt-4 text-sm leading-6 text-gray-600">
                      {companyQueue.description}
                    </p>
                  )}
                </article>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
                  Ingen bostadskö hittades för företaget.
                </div>
              )}
            </div>
          </main>
        </section>
      </div>
    </div>
  );
}
