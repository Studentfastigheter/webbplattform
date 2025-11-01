"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Filters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState(params.get("q") || "");
  const [city, setCity] = useState(params.get("city") || "");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") || "");

  // Debounce uppdatering av URL
  const debounced = useMemo(() => {
    let t: any = null;
    return (fn: () => void) => { if (t) clearTimeout(t); t = setTimeout(fn, 300); };
  }, []);

  useEffect(() => {
    debounced(() => {
      const s = new URLSearchParams();
      if (q) s.set("q", q);
      if (city) s.set("city", city);
      if (minPrice) s.set("minPrice", minPrice);
      if (maxPrice) s.set("maxPrice", maxPrice);
      s.set("page", "0");
      router.replace(`${pathname}?${s.toString()}`, { scroll: false });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, city, minPrice, maxPrice]);

  function reset() {
    setQ(""); setCity(""); setMinPrice(""); setMaxPrice("");
    router.replace(pathname, { scroll: false });
  }

  return (
    <aside className="card shadow-soft">
      <div className="font-semibold mb-3">Filtrera</div>

      <div className="grid gap-3">
        <div className="fieldset">
          <label className="label">Sök</label>
          <input
            className="input"
            placeholder="Titel eller stad"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
          />
        </div>

        <div className="fieldset">
          <label className="label">Stad</label>
          <input
            className="input"
            placeholder="t.ex. Göteborg"
            value={city}
            onChange={(e)=>setCity(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="fieldset">
            <label className="label">Min pris</label>
            <input
              className="input"
              placeholder="0"
              inputMode="numeric"
              value={minPrice}
              onChange={(e)=>setMinPrice(e.target.value.replace(/\D/g,''))}
            />
          </div>
          <div className="fieldset">
            <label className="label">Max pris</label>
            <input
              className="input"
              placeholder="15000"
              inputMode="numeric"
              value={maxPrice}
              onChange={(e)=>setMaxPrice(e.target.value.replace(/\D/g,''))}
            />
          </div>
        </div>

        <div>
          <button className="btn btn-outline" onClick={reset}>Rensa filter</button>
        </div>
      </div>
    </aside>
  );
}

