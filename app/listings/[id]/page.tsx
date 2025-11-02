"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useSchool } from '@/context/SchoolContext';

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
  const { school } = useSchool();
  const [data, setData] = useState<ListingPublic | ListingPrivate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [activities, setActivities] = useState<Array<{id:number;name:string;category:string;distanceKm:number}> | null>(null);
  // Keep hooks at stable positions; define carousel state before any early returns
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!ready) return;
    if (!id) return;
    setLoading(true);
    const qs = school?.id ? `?schoolId=${school.id}` : '';
    const url = token ? `/api/listings/${id}/secure${qs}` : `/api/listings/${id}${qs}`;
    fetch(url, { cache: 'no-store', headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      .then(r => r.ok ? r.json() : r.text().then(t => Promise.reject(new Error(t || r.statusText))))
      .then(setData)
      .catch(e => setError(e.message || 'Kunde inte ladda annonsen'))
      .finally(() => setLoading(false));
  }, [id, token, ready, school?.id]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/listings/${id}/activities?radiusKm=1.5`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then(setActivities)
      .catch(() => setActivities([]));
  }, [id]);

  if (!ready || loading) return <main className="container-page"><div className="section">Laddar…</div></main>;
  if (error) return <main className="container-page"><div className="section" style={{color:'crimson'}}>{error}</div></main>;
  if (!data) return <main className="container-page"><div className="section">Annons saknas.</div></main>;

  const isPrivate = 'address' in data || 'description' in data || 'latitude' in data;

  const imgs = ((data as any)?.images as string[] | undefined) || undefined;

  const go = (d: number) => {
    if (!imgs || imgs.length === 0) return;
    setIdx((prev) => (prev + d + imgs.length) % imgs.length);
  };

  return (
    <main className="container-page">
      <section className="section grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div>
          <div className="relative w-full h-72 rounded-md overflow-hidden bg-gray-100 mb-4">
            <Image src={(imgs && imgs.length>0 ? imgs[idx] : (data.imageUrl || '/placeholder.svg'))} alt={data.title} fill className="object-cover" />
            {imgs && imgs.length>1 && (
              <>
                <button className="btn btn-ghost" style={{ position:'absolute', top:'50%', left:8, transform:'translateY(-50%)' }} onClick={()=>go(-1)}>‹</button>
                <button className="btn btn-ghost" style={{ position:'absolute', top:'50%', right:8, transform:'translateY(-50%)' }} onClick={()=>go(1)}>›</button>
                <div style={{ position:'absolute', bottom:8, left:0, right:0 }} className="flex gap-2 justify-center">
                  {imgs.map((u, i) => (
                    <button key={i} className={`pill ${i===idx?'bg-brand text-white':'bg-white'}`} style={{ opacity: i===idx?1:0.6 }} onClick={()=>setIdx(i)}>
                      {i+1}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <h1 className="h1 mb-2">{data.title}</h1>
          <div className="text-muted mb-4">{data.city}{('distanceToSchoolKm' in data && (data as any).distanceToSchoolKm) ? ` • ${(data as any).distanceToSchoolKm.toFixed(1)} km till ${school?.name}` : ''}</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {typeof (data as any).area === 'number' && <div className="card"><div className="text-sm text-muted">Yta</div><div className="font-semibold">{(data as any).area} m²</div></div>}
            {typeof (data as any).rooms === 'number' && <div className="card"><div className="text-sm text-muted">Rum</div><div className="font-semibold">{(data as any).rooms}</div></div>}
            {(data as any).type && <div className="card"><div className="text-sm text-muted">Typ</div><div className="font-semibold">{(data as any).type}</div></div>}
            {(data as any).availableFrom && <div className="card"><div className="text-sm text-muted">Inflytt</div><div className="font-semibold">{new Date((data as any).availableFrom as string).toLocaleDateString()}</div></div>}
          </div>
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
          <div className="card">
            <div className="font-semibold mb-1">Nära aktiviteter</div>
            {!activities && <div className="text-sm text-muted">Laddar…</div>}
            {activities && activities.length === 0 && <div className="text-sm text-muted">Inga träffar i närheten.</div>}
            {activities && activities.length > 0 && (
              <ul className="text-sm space-y-1">
                {activities.slice(0,8).map(a => (
                  <li key={a.id} className="flex items-center justify-between"><span>{a.name} <span className="subtle">({a.category})</span></span><span className="subtle">{a.distanceKm.toFixed(1)} km</span></li>
                ))}
              </ul>
            )}
          </div>
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
