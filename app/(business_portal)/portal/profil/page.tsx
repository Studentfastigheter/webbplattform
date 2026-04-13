"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import QueueHero from "@/components/ads/QueueHero";
import QueueListings from "@/components/ads/QueueListings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { queueService, type CompanyDTO } from "@/services/queue-service";
import { type ListingCardDTO } from "@/types/listing";
import { type HousingQueueDTO } from "@/types/queue";
import { Eye, Loader2, Save } from "lucide-react";
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

type EditableQueueDraft = {
  id: string;
  name: string;
  city: string;
  waitDays: string;
  totalUnits: string;
};

type StoredProfileDraft = {
  fields: ProfileDraft;
  queues: EditableQueueDraft[];
};

const parseOptionalNumber = (value: string): number | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const numberToInput = (value?: number): string => {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return String(value);
};

const queueToEditable = (queue: HousingQueueDTO): EditableQueueDraft => ({
  id: queue.id,
  name: queue.name,
  city: queue.city ?? "",
  waitDays: numberToInput(queue.waitDays),
  totalUnits: numberToInput(queue.totalUnits),
});

const createFallbackQueue = (name: string): EditableQueueDraft => ({
  id: "preview-queue",
  name: name ? `${name} ko` : "Din kö",
  city: "",
  waitDays: "",
  totalUnits: "",
});

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
  const [baseQueues, setBaseQueues] = useState<HousingQueueDTO[]>([]);
  const [queueEdits, setQueueEdits] = useState<EditableQueueDraft[]>([]);
  const [listings, setListings] = useState<ListingCardDTO[]>([]);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState(false);

  const companyId =
    user && user.accountType !== "student" ? Number(user.id) : null;

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
    if (authLoading || !user || user.accountType === "student") {
      return;
    }

    if (companyId == null || Number.isNaN(companyId)) {
      setError("Ogiltigt foretags-ID.");
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([
      queueService.getCompany(companyId),
      queueService.getByCompany(companyId),
      queueService.getCompanyListings(companyId),
    ])
      .then(([companyData, companyQueues, companyListings]) => {
        if (!active) return;

        const normalizedQueues = Array.isArray(companyQueues) ? companyQueues : [];
        const firstQueue = normalizedQueues[0];
        const storageKey = `${DRAFT_STORAGE_PREFIX}-${companyId}`;

        const initialDraft = buildInitialDraft(companyId, companyData, firstQueue);
        const initialQueueEdits =
          normalizedQueues.length > 0
            ? normalizedQueues.map(queueToEditable)
            : [createFallbackQueue(initialDraft.name)];

        let nextDraft = initialDraft;
        let nextQueueEdits = initialQueueEdits;

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

              if (Array.isArray(parsed?.queues) && parsed.queues.length > 0) {
                nextQueueEdits = parsed.queues;
              }
            } catch {
              // Ignore invalid local draft payload.
            }
          }
        }

        setCompany(companyData);
        setBaseQueues(normalizedQueues);
        setListings(Array.isArray(companyListings) ? companyListings : []);
        setDraft(nextDraft);
        setQueueEdits(nextQueueEdits);
      })
      .catch((fetchError) => {
        if (!active) return;

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Kunde inte ladda foretagsprofilen."
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

  const previewQueues = useMemo(() => {
    if (!draft) return [];

    const baseQueueById = new Map(baseQueues.map((queue) => [queue.id, queue]));

    return queueEdits.map((queueEdit) => {
      const baseQueue = baseQueueById.get(queueEdit.id);
      const facebook = draft.facebook || baseQueue?.socialLinks?.facebook;
      const linkedin = draft.linkedin || baseQueue?.socialLinks?.linkedin;

      return {
        id: queueEdit.id,
        companyId: company?.id ?? draft.companyId,
        name: queueEdit.name || baseQueue?.name || "Ko",
        city: queueEdit.city || baseQueue?.city || "",
        logoUrl: draft.logoUrl || baseQueue?.logoUrl || "/logos/campuslyan-logo.svg",
        bannerUrl: draft.bannerUrl || baseQueue?.bannerUrl || "/appartment.jpg",
        description: draft.description || baseQueue?.description,
        website: draft.website || baseQueue?.website,
        activeListings: listings.length,
        contactEmail: draft.contactEmail || baseQueue?.contactEmail,
        contactPhone: draft.contactPhone || baseQueue?.contactPhone,
        totalUnits: parseOptionalNumber(queueEdit.totalUnits) ?? baseQueue?.totalUnits,
        waitDays: parseOptionalNumber(queueEdit.waitDays) ?? baseQueue?.waitDays,
        socialLinks:
          facebook || linkedin
            ? {
                facebook: facebook || undefined,
                linkedin: linkedin || undefined,
              }
            : undefined,
      } satisfies HousingQueueDTO;
    });
  }, [baseQueues, company?.id, draft, listings.length, queueEdits]);

  const heroQueue = useMemo(() => {
    if (!draft) return null;

    const totalUnits = previewQueues.reduce((sum, queue) => {
      return sum + (queue.totalUnits ?? 0);
    }, 0);

    const waitDaysList = previewQueues
      .map((queue) => queue.waitDays)
      .filter((value): value is number => typeof value === "number");

    const averageWaitDays =
      waitDaysList.length > 0
        ? Math.round(
            waitDaysList.reduce((sum, value) => sum + value, 0) /
              waitDaysList.length
          )
        : undefined;

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
      activeListings: listings.length,
      totalUnits,
      waitDays: averageWaitDays,
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
  }, [company, draft, listings.length, previewQueues]);

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

  const updateQueueField = <K extends keyof EditableQueueDraft>(
    queueId: string,
    key: K,
    value: EditableQueueDraft[K]
  ) => {
    setQueueEdits((current) =>
      current.map((queue) =>
        queue.id === queueId ? { ...queue, [key]: value } : queue
      )
    );
    setSaveMessage(null);
  };

  const addPreviewQueue = () => {
    setQueueEdits((current) => [
      ...current,
      {
        id: `preview-${Date.now()}`,
        name: "Ny kö",
        city: "",
        waitDays: "",
        totalUnits: "",
      },
    ]);
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
        queues: queueEdits,
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
        Logga in for att hantera foretagsprofilen.
      </div>
    );
  }

  if (user.accountType === "student") {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Denna profilsida galler bara for foretagskonton.
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
          sidan for alla köer.
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

      <div className="grid gap-6 2xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card className="h-fit border-gray-200 bg-white 2xl:sticky 2xl:top-24">
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
                placeholder="Ange foretagsnamn"
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
                placeholder="Kort beskrivning av foretaget"
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
                placeholder="Beskriv foretaget"
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Koer i preview</Label>
                <Button variant="outline" size="sm" onClick={addPreviewQueue}>
                  Ny ko
                </Button>
              </div>

              <div className="space-y-3">
                {queueEdits.map((queue) => (
                  <div
                    key={queue.id}
                    className="rounded-lg border border-gray-200 p-3"
                  >
                    <div className="grid gap-3">
                      <Input
                        value={queue.name}
                        onChange={(event) =>
                          updateQueueField(queue.id, "name", event.target.value)
                        }
                        placeholder="Konamn"
                      />
                      <div className="grid gap-3 sm:grid-cols-3">
                        <Input
                          value={queue.city}
                          onChange={(event) =>
                            updateQueueField(
                              queue.id,
                              "city",
                              event.target.value
                            )
                          }
                          placeholder="Stad"
                        />
                        <Input
                          value={queue.waitDays}
                          onChange={(event) =>
                            updateQueueField(
                              queue.id,
                              "waitDays",
                              event.target.value
                            )
                          }
                          placeholder="Kö-dagar"
                        />
                        <Input
                          value={queue.totalUnits}
                          onChange={(event) =>
                            updateQueueField(
                              queue.id,
                              "totalUnits",
                              event.target.value
                            )
                          }
                          placeholder="Antal bostader"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} isLoading={saving}>
              {!saving && <Save className="h-4 w-4" />}
              Spara profil
            </Button>
          </CardContent>
        </Card>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="inline-flex items-center gap-2 text-base font-semibold text-gray-900">
                <Eye className="h-4 w-4" />
                Offentlig forhandsvisning
              </h2>
              <p className="text-sm text-gray-600">
                Samma layout som sidan /alla-koer/[id].
              </p>
            </div>

            {company?.id ? (
              <Link
                href={`/alla-koer/${company.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[#004225] hover:underline"
              >
                Oppna publik sida
              </Link>
            ) : null}
          </div>

          <main className="min-h-screen bg-white px-2 pb-8 sm:px-4 lg:px-6">
            <QueueHero queue={heroQueue} />

            {previewQueues.length > 0 && (
              <div className="mx-auto mt-10 max-w-4xl px-4 sm:px-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Bostadskoer
                </h2>
                <div className="space-y-3">
                  {previewQueues.map((queue) => (
                    <div
                      key={queue.id}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{queue.name}</p>
                        <p className="text-sm text-gray-500">
                          {queue.city || "Stad saknas"}
                          {queue.waitDays != null &&
                            ` | ca ${queue.waitDays} dagars kotid`}
                          {queue.totalUnits != null &&
                            ` | ${queue.totalUnits} bostader`}
                        </p>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        className="shrink-0 opacity-80"
                        isDisabled
                      >
                        Forhandsvisning
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mx-auto mt-10 max-w-4xl px-4 pb-16 sm:px-6">
              {listings.length > 0 ? (
                <QueueListings
                  listings={listings}
                  title={`Lediga bostader hos ${heroQueue.name}`}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
                  Det finns inga lediga bostader publicerade just nu.
                </div>
              )}
            </div>
          </main>
        </section>
      </div>
    </div>
  );
}
