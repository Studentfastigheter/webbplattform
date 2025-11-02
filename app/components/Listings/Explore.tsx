"use client";

import { useState } from "react";
import Filters from "./Filters";
import ListOnly from "./ListOnly";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("../MapFunctionality/MapView"), { ssr: false });
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import type { Listing } from "../MapFunctionality/MapView";
import { useSchool } from "@/context/SchoolContext";

export default function Explore() {
  const [mode, setMode] = useState<'map'|'list'>('map');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">Visa läge</div>
        <div className="flex gap-2">
          <button className={`btn ${mode==='map'?'btn-primary':'btn-outline'}`} onClick={()=>setMode('map')}>Karta</button>
          <button className={`btn ${mode==='list'?'btn-primary':'btn-outline'}`} onClick={()=>setMode('list')}>Lista</button>
        </div>
      </div>

      <Filters />

      {mode === 'map' ? <MapMode /> : <ListOnly />}
    </div>
  );
}

function MapMode() {
  const params = useSearchParams();
  const { token, ready } = useAuth();
  const { school } = useSchool();
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const qs = useMemo(() => {
    const s = new URLSearchParams(params.toString());
    s.set("page", "0");
    s.set("size", "120"); // fetch more for map
    if (school?.id) s.set("schoolId", String(school.id));
    return s.toString();
  }, [params, school?.id]);

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    const url = token ? `/api/listings/secure?${qs}` : `/api/listings?${qs}`;
    fetch(url, { cache: "no-store", headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: {items: Listing[]}) => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [qs, token, ready]);

  return (
    <div className="map-shell" style={{ height: 560 }}>
      {!loading && <MapView listings={items} richMarkers />}
      {loading && <div className="p-4">Laddar karta…</div>}
    </div>
  );
}

