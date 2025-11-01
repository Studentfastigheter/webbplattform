"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

type ListingPublic = {
  id: number;
  title: string;
  city: string;
  price: number;
  imageUrl?: string | null;
  companyName?: string | null;
};

type ListingPrivate = ListingPublic & {
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  address?: string | null;
  companyId?: number | null;
  userQueueDays?: number | null;
};

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, ready } = useAuth();
  const [data, setData] = useState<ListingPublic | ListingPrivate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!id) return;
    setLoading(true);
    const url = token ? `/api/listings/${id}/secure` : `/api/listings/${id}`;
    fetch(url, { cache: 'no-store', headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      .then(r => r.ok ? r.json() : r.text().then(t => Promise.reject(new Error(t || r.statusText))))
      .then(setData)
      .catch(e => setError(e.message || 'Kunde inte ladda annonsen'))
      .finally(() => setLoading(false));
  }, [id, token, ready]);

  if (!ready || loading) return <main className="container-page"><div className="section">Laddar…</div></main>;
  if (error) return <main className="container-page"><div className="section" style={{color:'crimson'}}>{error}</div></main>;
  if (!data) return <main className="container-page"><div className="section">Annons saknas.</div></main>;

  const isPrivate = 'address' in data || 'description' in data || 'latitude' in data;

  return (
    <main className="container-page">
      <section className="section grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div>
          <div className="relative w-full h-72 rounded-md overflow-hidden bg-gray-100 mb-4">
            <Image src={data.imageUrl || '/placeholder.svg'} alt={data.title} fill className="object-cover" />
          </div>
          <h1 className="h1 mb-2">{data.title}</h1>
          <div className="text-muted mb-4">{data.city}</div>
          {'description' in data && data.description && (
            <p className="leading-relaxed whitespace-pre-line">{data.description}</p>
          )}
        </div>
        <aside className="space-y-4">
          <div className="card">
            <div className="text-sm text-muted">Hyra</div>
            <div className="text-2xl font-semibold">{data.price} kr/mån</div>
          </div>
          <div className="card">
            <div className="text-sm text-muted mb-1">Uthyres av</div>
            <div className="font-semibold">{data.companyName || '—'}</div>
            {isPrivate && 'userQueueDays' in data && (
              <div className="mt-2 text-sm">
                Dina ködagar hos {data.companyName || 'bolaget'}: <b>{(data as ListingPrivate).userQueueDays ?? 0}</b>
              </div>
            )}
          </div>
          {isPrivate ? (
            <div className="card">
              <div className="text-sm text-muted mb-1">Adress</div>
              <div>{(data as ListingPrivate).address || '—'}</div>
            </div>
          ) : (
            <div className="card text-sm text-muted">
              Logga in för att se adress och mer info.
            </div>
          )}
          {isPrivate && 'companyId' in data && (data as ListingPrivate).companyId && (
            <Actions companyId={(data as ListingPrivate).companyId!} listingId={data.id} onMessage={setActionMsg} />
          )}
          {actionMsg && <div className="text-brand">{actionMsg}</div>}
        </aside>
      </section>
    </main>
  );
}

function Actions({ companyId, listingId, onMessage }:{ companyId: number; listingId: number; onMessage: (m:string)=>void }) {
  const { token } = useAuth();
  const [joining, setJoining] = useState(false);
  const [interested, setInterested] = useState(false);

  const join = async () => {
    if (!token) { onMessage('Logga in för att gå med i kö.'); return; }
    setJoining(true); onMessage('');
    try {
      const res = await fetch(`/api/queues/join?companyId=${companyId}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text().catch(()=>res.statusText));
      onMessage('Du står nu i kön.');
    } catch (e:any) { onMessage(e.message || 'Kunde inte gå med i kön.'); }
    finally { setJoining(false); }
  };

  const interest = async () => {
    if (!token) { onMessage('Logga in för att intresseanmäla.'); return; }
    setInterested(true); onMessage('');
    try {
      const res = await fetch(`/api/listings/${listingId}/interest`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text().catch(()=>res.statusText));
      onMessage('Intresseanmälan skickad.');
    } catch (e:any) { onMessage(e.message || 'Kunde inte skicka intresse.'); }
    finally { setInterested(false); }
  };

  return (
    <div className="card space-y-2">
      <button className="btn btn-outline" onClick={join} disabled={joining}>{joining ? 'Lägger till…' : 'Gå med i kö'}</button>
      <button className="btn btn-primary" onClick={interest} disabled={interested}>{interested ? 'Skickar…' : 'Intresseanmälan'}</button>
    </div>
  );
}

