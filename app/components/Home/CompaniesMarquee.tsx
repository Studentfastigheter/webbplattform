"use client";

import { useEffect, useState } from "react";

type Company = { id:number; name:string };

export default function CompaniesMarquee() {
  const [items, setItems] = useState<Company[]>([]);
  useEffect(() => {
    fetch('/api/companies', { cache: 'no-store' })
      .then(r=>r.ok?r.json():[])
      .then(setItems)
      .catch(()=>setItems([]));
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="section-sm border-y border-border bleed">
      <div className="container-page text-center text-sm text-muted mb-3">Studentbostadsföretag på plattformen</div>
      <div className="marquee">
        <div className="marquee-track">
          {[...items, ...items].map((c, i) => (
            <span key={i} className="marquee-item">{c.name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
