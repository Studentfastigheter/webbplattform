"use client";

import { useEffect, useState } from "react";
import { useSchool } from "@/context/SchoolContext";

type School = { id:number; name:string; city?:string };

const cityImage: Record<string, string> = {
  "Göteborg": "https://images.unsplash.com/photo-1543872084-c7bd3822856f",
  "Stockholm": "https://images.unsplash.com/photo-1509356843151-3e7d96241e14",
  "Lund": "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
  "Borås": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
};

export default function StudentCities() {
  const [schools, setSchools] = useState<School[]>([]);
  const { setSchool } = useSchool();

  useEffect(() => {
    fetch('/api/schools', { cache: 'no-store' })
      .then(r=>r.ok?r.json():[])
      .then((rows: any[]) => setSchools(rows as School[]))
      .catch(()=>setSchools([]));
  }, []);

  const byCity: Record<string, School> = {};
  for (const s of schools) {
    const city = (s.city || s.name).trim();
    if (!byCity[city]) byCity[city] = s;
  }
  const cities = Object.entries(byCity);

  if (cities.length === 0) return null;

  function onCityClick(id:number, name:string) {
    setSchool({ id, name });
    const el = document.getElementById('queues');
    if (el) el.scrollIntoView({ behavior:'smooth' });
  }

  return (
    <section className="section bleed">
      <div className="container-page">
        <h2 className="h2 mb-3">Utforska köerna</h2>
      </div>
      <div className="cities-marquee">
        <div className="cities-track">
          {[...cities, ...cities].map(([city, s], i) => (
            <button key={i} className="city-card shadow-soft" onClick={()=>onCityClick(s.id, s.name)}>
              <img src={cityImage[city] || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee'} alt={city} />
              <span className="overlay" />
              <span className="label">{city}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="container-page mt-4 text-center">
        <a href="#queues" className="btn btn-outline">Utforska köerna</a>
      </div>
    </section>
  );
}
