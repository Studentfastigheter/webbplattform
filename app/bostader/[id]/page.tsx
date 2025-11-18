"use client";

import { ReactNode, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { Button } from "@heroui/button";
import { SkeletonImage } from "@/components/ui/skeleton-image";

const ListingMap = dynamic(() => import("@/app/components/Listings/ListingMap"), {
  ssr: false,
});

type ListingPublic = {
  id: number;
  title: string;
  city: string;
  price: number;
  imageUrl?: string | null;
  companyName?: string | null;
  images?: string[];
  area?: number | null;
  rooms?: number | null;
  type?: string | null;
  availableFrom?: string | null;
  distanceToSchoolKm?: number | null;
};

type ListingPrivate = ListingPublic & {
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  address?: string | null;
  companyId?: number | null;
  userQueueDays?: number | null;
};

const parseCoordinate = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const normalised = value.replace(",", ".").trim();
    const parsed = parseFloat(normalised);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, ready } = useAuth();
  const { school } = useSchool();

  const [data, setData] = useState<ListingPublic | ListingPrivate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [activities, setActivities] = useState<Array<{ id: number; name: string; category: string; distanceKm: number }> | null>(null);
  const [idx, setIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "error" | "success">("idle");

  // --- Effects (always called, in a fixed order) ---
  useEffect(() => {
    setCoords(null);
    setGeoStatus("idle");
  }, [id]);

  useEffect(() => {
    if (!ready || !id) return;
    setLoading(true);
    const qs = school?.id ? `?schoolId=${school.id}` : "";
    const url = token ? `/api/listings/${id}/secure${qs}` : `/api/listings/${id}${qs}`;
    fetch(url, { cache: "no-store", headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      .then(r => (r.ok ? r.json() : r.text().then(t => Promise.reject(new Error(t || r.statusText)))))
      .then(setData)
      .catch(e => setError(e.message || "Kunde inte ladda annonsen"))
      .finally(() => setLoading(false));
  }, [id, token, ready, school?.id]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/listings/${id}/activities?radiusKm=1.5`, { cache: "no-store" })
      .then(r => (r.ok ? r.json() : []))
      .then(setActivities)
      .catch(() => setActivities([]));
  }, [id]);

  useEffect(() => {
    if (!data) return;

    const lat = parseCoordinate((data as any).latitude);
    const lng = parseCoordinate((data as any).longitude);
    if (lat !== null && lng !== null) {
      setCoords({ lat, lng });
      setGeoStatus("success");
      return;
    }

    const rawAddress = "address" in data ? (data as ListingPrivate).address : null;
    const query = rawAddress?.trim() || [data.title, data.city].filter(Boolean).join(" ").trim();

    if (!query) {
      if (geoStatus === "idle") setGeoStatus("error");
      return;
    }
    if (geoStatus === "loading") return;

    let cancelled = false;
    setGeoStatus("loading");

    fetch(`/geocode?q=${encodeURIComponent(query)}`, { cache: "no-store" })
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then((items: any[]) => {
        if (cancelled) return;
        if (Array.isArray(items) && items.length > 0) {
          const latNum = parseFloat(items[0].lat);
          const lonNum = parseFloat(items[0].lon);
          if (!Number.isNaN(latNum) && !Number.isNaN(lonNum)) {
            setCoords({ lat: latNum, lng: lonNum });
            setGeoStatus("success");
            return;
          }
        }
        setGeoStatus("error");
      })
      .catch(() => {
        if (!cancelled) setGeoStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [data, geoStatus]);

  // ✅ Reset image index whenever the listing changes — kept ABOVE any early returns
  useEffect(() => {
    setIdx(0);
  }, [data?.id]);

  // --- Rendering helpers & early returns ---
  const renderFallback = (content: ReactNode) => (
    <main className="section">
      <div className="container-page">
        <div className="mx-auto max-w-5xl">{content}</div>
      </div>
    </main>
  );

  if (!ready || loading) {
    return renderFallback(<div className="card text-center">Laddar…</div>);
  }

  if (error) {
    return renderFallback(
      <div className="card text-center text-red-600">{error}</div>,
    );
  }

  if (!data) {
    return renderFallback(<div className="card text-center">Annons saknas.</div>);
  }

  // --- Derived data computed after we know we have `data` ---
  const isPrivate = "address" in data || "description" in data || "latitude" in data;
  const imgs = ((data as any)?.images as string[] | undefined) ?? undefined;
  const hasMultipleImages = !!imgs && imgs.length > 1;
  const activeImage = imgs?.[idx] ?? data.imageUrl ?? "/placeholder.svg";

  const go = (direction: number) => {
    if (!imgs || imgs.length === 0) return;
    setIdx(prev => (prev + direction + imgs.length) % imgs.length);
  };

  const closeLightbox = () => setLightboxOpen(false);

  return (
    <main className="section">
      <div className="container-page">
        <section className="mx-auto max-w-5xl grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div>
            <div
              className="relative w-full h-72 rounded-3xl overflow-hidden bg-gray-100 mb-6 group cursor-zoom-in shadow-lg"
              onClick={() => setLightboxOpen(true)}
              role="button"
            >
              <SkeletonImage
                key={activeImage}
                src={activeImage}
                alt={data.title}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-end p-3 text-sm text-white">
                <span>Visa i helskärm</span>
              </div>
              {hasMultipleImages && (
                <>
                  <Button
                    type="button"
                    isIconOnly
                    variant="light"
                    radius="full"
                    className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/80 text-slate-900 hover:bg-white"
                    onClick={event => {
                      event.stopPropagation();
                      go(-1);
                    }}
                    aria-label="Föregående bild"
                  >
                    <span aria-hidden>‹</span>
                  </Button>
                  <Button
                    type="button"
                    isIconOnly
                    variant="light"
                    radius="full"
                    className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/80 text-slate-900 hover:bg-white"
                    onClick={event => {
                      event.stopPropagation();
                      go(1);
                    }}
                    aria-label="Nästa bild"
                  >
                    <span aria-hidden>›</span>
                  </Button>
                </>
              )}
            </div>

            {hasMultipleImages && (
              <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
                {imgs!.map((url, i) => (
                  <button
                    key={`${url}-${i}`}
                    type="button"
                    onClick={() => {
                      setIdx(i);
                      setLightboxOpen(false);
                    }}
                    className={`relative h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden border ${i === idx ? "border-brand" : "border-transparent"} focus:outline-none focus:ring-2 focus:ring-brand/60`}
                  >
                  <SkeletonImage
                    src={url}
                    alt={`Bild ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                  </button>
                ))}
              </div>
            )}

            <h1 className="h1 mb-2">{data.title}</h1>
            <div className="text-muted mb-4">
              {data.city}
              {("distanceToSchoolKm" in data && (data as any).distanceToSchoolKm)
                ? ` • ${(data as any).distanceToSchoolKm.toFixed(1)} km till ${school?.name}`
                : ""}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {typeof (data as any).area === "number" && (
                <div className="card">
                  <div className="text-sm text-muted">Yta</div>
                  <div className="font-semibold">{(data as any).area} m²</div>
                </div>
              )}
              {typeof (data as any).rooms === "number" && (
                <div className="card">
                  <div className="text-sm text-muted">Rum</div>
                  <div className="font-semibold">{(data as any).rooms}</div>
                </div>
              )}
              {(data as any).type && (
                <div className="card">
                  <div className="text-sm text-muted">Typ</div>
                  <div className="font-semibold">{(data as any).type}</div>
                </div>
              )}
              {(data as any).availableFrom && (
                <div className="card">
                  <div className="text-sm text-muted">Inflytt</div>
                  <div className="font-semibold">{new Date((data as any).availableFrom as string).toLocaleDateString()}</div>
                </div>
              )}
            </div>

            {"description" in data && data.description && (
              <p className="leading-relaxed whitespace-pre-line">{data.description}</p>
            )}

            {coords && (
              <div className="card mt-6 space-y-2">
                <div className="font-semibold">På kartan</div>
                <div className="h-64">
                  <ListingMap lat={coords.lat} lng={coords.lng} title={data.title} />
                </div>
              </div>
            )}
            {!coords && geoStatus === "loading" && (
              <div className="card mt-6 text-sm text-muted">Hämtar position…</div>
            )}
            {!coords && geoStatus === "error" && (
              <div className="card mt-6 text-sm text-muted">Kunde inte visa kartan för den här adressen.</div>
            )}
          </div>

        <aside className="space-y-4">
          <div className="card">
            <div className="text-sm text-muted">Hyra</div>
            <div className="text-2xl font-semibold">{data.price} kr/mån</div>
          </div>
          <div className="card">
            <div className="text-sm text-muted mb-1">Uthyres av</div>
            <div className="font-semibold">{data.companyName || "—"}</div>
            {isPrivate && "userQueueDays" in data && (
              <div className="mt-2 text-sm">
                Dina ködagar hos {data.companyName || "bolaget"}: <b>{(data as ListingPrivate).userQueueDays ?? 0}</b>
              </div>
            )}
          </div>
          {isPrivate ? (
            <div className="card">
              <div className="text-sm text-muted mb-1">Adress</div>
              <div>{(data as ListingPrivate).address || "—"}</div>
            </div>
          ) : (
            <div className="card text-sm text-muted">
              Logga in för att se adress och mer info.
            </div>
          )}
          {isPrivate && "companyId" in data && (data as ListingPrivate).companyId && (
            <Actions companyId={(data as ListingPrivate).companyId!} listingId={data.id} onMessage={setActionMsg} />
          )}
          {actionMsg && <div className="text-brand">{actionMsg}</div>}
          <div className="card">
            <div className="font-semibold mb-1">Nära aktiviteter</div>
            {!activities && <div className="text-sm text-muted">Laddar…</div>}
            {activities && activities.length === 0 && <div className="text-sm text-muted">Inga träffar i närheten.</div>}
            {activities && activities.length > 0 && (
              <ul className="text-sm space-y-1">
                {activities.slice(0, 8).map(a => (
                  <li key={a.id} className="flex items-center justify-between">
                    <span>
                      {a.name} <span className="subtle">({a.category})</span>
                    </span>
                    <span className="subtle">{a.distanceKm.toFixed(1)} km</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </section>
    </div>

    {lightboxOpen && (
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col gap-4 items-center justify-center p-6"
        onClick={closeLightbox}
      >
        <button
          type="button"
          className="self-end text-sm text-white/80 hover:text-white"
          onClick={closeLightbox}
        >
          Stäng ×
        </button>
        <div className="relative w-full max-w-4xl h-[70vh]" onClick={e => e.stopPropagation()}>
          <SkeletonImage
            src={activeImage}
            alt={data.title}
            fill
            priority
            className="object-contain"
          />
        </div>
        {hasMultipleImages && (
          <div className="flex gap-3 overflow-x-auto" onClick={e => e.stopPropagation()}>
            {imgs!.map((url, i) => (
              <button
                key={`lightbox-${url}-${i}`}
                type="button"
                onClick={() => setIdx(i)}
                className={`relative h-16 w-24 flex-shrink-0 rounded-md overflow-hidden border ${i === idx ? "border-brand" : "border-transparent"}`}
              >
                <SkeletonImage
                  src={url}
                  alt={`Bild ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    )}
    </main>
  );
}

function Actions({ companyId, listingId, onMessage }: { companyId: number; listingId: number; onMessage: (m: string) => void }) {
  const { token } = useAuth();
  const [joining, setJoining] = useState(false);
  const [interested, setInterested] = useState(false);

  const join = async () => {
    if (!token) {
      onMessage("Logga in för att gå med i kön.");
      return;
    }
    setJoining(true);
    onMessage("");
    try {
      const res = await fetch(`/api/queues/join?companyId=${companyId}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
      onMessage("Du står nu i kön.");
    } catch (e: any) {
      onMessage(e.message || "Kunde inte gå med i kön.");
    } finally {
      setJoining(false);
    }
  };

  const interest = async () => {
    if (!token) {
      onMessage("Logga in för att skicka intresse.");
      return;
    }
    setInterested(true);
    onMessage("");
    try {
      const res = await fetch(`/api/listings/${listingId}/interest`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
      onMessage("Intresseanmälan skickad.");
    } catch (e: any) {
      onMessage(e.message || "Kunde inte skicka intresse.");
    } finally {
      setInterested(false);
    }
  };

  return (
    <div className="card space-y-2">
      <Button
        variant="bordered"
        color="success"
        isDisabled={joining}
        isLoading={joining}
        onPress={join}
      >
        {joining ? "Lägger till…" : "Gå med i kön"}
      </Button>
      <Button
        color="success"
        isDisabled={interested}
        isLoading={interested}
        onPress={interest}
      >
        {interested ? "Skickar…" : "Intresseanmälan"}
      </Button>
    </div>
  );
}
