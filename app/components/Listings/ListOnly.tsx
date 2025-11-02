"use client";

import { useEffect, useMemo, useState } from "react";
import ListingCard from "./ListingCard";
import type { Listing } from "../MapFunctionality/MapView";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";

type ApiResp = {
  items: Listing[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
};

export default function ListOnly() {
  const params = useSearchParams();
  const { token, ready } = useAuth();
  const { school } = useSchool();
  const [data, setData] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(true);

  const page = Number(params.get("page") || 0);

  const qs = useMemo(() => {
    const s = new URLSearchParams(params.toString());
    s.set("page", String(page));
    s.set("size", "12");
    if (school?.id) s.set("schoolId", String(school.id));
    return s.toString();
  }, [params, page, school?.id]);

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((l) => (
              <ListingCard key={l.id} l={l} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

