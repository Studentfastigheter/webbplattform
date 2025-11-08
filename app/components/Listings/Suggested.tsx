"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSchool } from '@/context/SchoolContext';
import { SkeletonImage } from '@/components/ui/skeleton-image';

type Item = {
  id: number;
  title: string;
  city?: string;
  price?: number;
  imageUrl?: string | null;
  images?: string[];
};

type ApiResp = { items: Item[] };

export default function Suggested() {
  const { school } = useSchool();
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const fetchUrl = school ? `/api/schools/${school.id}/listings?radiusKm=10&size=12` : '/api/listings?size=10';
    fetch(fetchUrl, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: any) => setItems((data.items || data) as Item[]))
      .catch(() => setItems([]));
  }, [school?.id]);

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h3 className="h2">Förslag nära dig</h3>
      <div className="text-muted">Bläddra bland utvalda lägenheter</div>
      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-full">
          {items.map((l) => (
            <Link key={l.id} href={`/listings/${l.id}`} className="block">
              <article className="card shadow-soft" style={{ width: 260 }}>
                <div className="relative w-full h-40 rounded-md overflow-hidden mb-3 bg-gray-100">
                  <SkeletonImage
                    src={(l.images?.[0] ?? l.imageUrl) || '/placeholder.svg'}
                    alt={l.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="font-semibold line-clamp-1">{l.title}</div>
                <div className="text-muted text-sm">{l.city || '—'}</div>
                <div className="mt-1 flex gap-2 items-center">
                  <span className="badge badge-brand">
                    {typeof l.price === 'number' ? `${l.price} kr/mån` : 'Pris ej angivet'}
                  </span>
                  {typeof (l as any).distanceToSchoolKm === 'number' && (
                    <span className="badge">{(l as any).distanceToSchoolKm.toFixed(1)} km</span>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
