"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Item = {
  id: number;
  title: string;
  city?: string;
  price?: number;
  imageUrl?: string | null;
};

type ApiResp = { items: Item[] };

export default function Suggested() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch('/api/listings?size=10', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: ApiResp) => setItems(data.items || []))
      .catch(() => setItems([]));
  }, []);

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
                  <Image src={l.imageUrl || '/placeholder.svg'} alt={l.title} fill className="object-cover" />
                </div>
                <div className="font-semibold line-clamp-1">{l.title}</div>
                <div className="text-muted text-sm">{l.city || '—'}</div>
                <div className="mt-1">
                  <span className="badge badge-brand">
                    {typeof l.price === 'number' ? `${l.price} kr/mån` : 'Pris ej angivet'}
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

