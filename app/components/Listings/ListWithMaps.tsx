"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import ListingCard from "./ListingCard";
import type { Listing } from "../MapFunctionality/MapView";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const MapView = dynamic(() => import("../MapFunctionality/MapView"), { ssr: false });

type ApiResp = {
  items: Listing[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
};

export default function ListWithMap() {
  const params = useSearchParams();
  const { token, ready } = useAuth();
  const [data, setData] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const page = Number(params.get("page") || 0);

  const qs = useMemo(() => {
    const s = new URLSearchParams(params.toString());
    s.set("page", String(page));
    s.set("size", "12");
    return s.toString();
  }, [params, page]);

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    const url = token ? `/api/listings/secure?${qs}` : `/api/listings?${qs}`;
    fetch(url, { cache: "no-store", headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setData({ items: [], page: 0, size: 12, total: 0, totalPages: 0 }))
      .finally(() => setLoading(false));
  }, [qs, token, ready]);

  const items = data?.items ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Lista */}
      <div className="space-y-4">
        {loading && <div className="card">Laddar…</div>}
        {!loading && items.length === 0 && (
          <div className="card">Inga träffar.</div>
        )}
        {!loading && items.length > 0 && (
          <>
            <div className="text-sm text-muted">
              Visar {items.length} av {data?.total} träffar
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((l) => (
                <ListingCard
                  key={l.id}
                  l={l}
                  onHover={(id) => setSelectedId(id)}
                  onLeave={() => setSelectedId(null)}
                />
              ))}
            </div>

            <Pager params={params} page={page} totalPages={data?.totalPages || 1} />
          </>
        )}
      </div>

      {/* Karta */}
      <div className="map-shell">
        <MapView
          listings={items}
          selectedId={selectedId}
          onMarkerClick={(id) => setSelectedId(id)}
        />
      </div>
    </div>
  );
}

function Pager({ params, page, totalPages }:{params:URLSearchParams; page:number; totalPages:number}) {
  const prevHref = buildPageHref(params, page - 1);
  const nextHref = buildPageHref(params, page + 1);
  return (
    <div className="flex items-center justify-between">
      {page <= 0 ? <span className="btn opacity-50">← Föregående</span> : <a className="btn" href={prevHref}>← Föregående</a>}
      <div className="text-sm text-muted">Sida {page + 1} / {Math.max(1, totalPages)}</div>
      {page + 1 >= totalPages ? <span className="btn opacity-50">Nästa →</span> : <a className="btn" href={nextHref}>Nästa →</a>}
    </div>
  );
}
function buildPageHref(params: URLSearchParams, target: number) {
  const s = new URLSearchParams(params.toString());
  s.set("page", String(target));
  return `?${s.toString()}`;
}
