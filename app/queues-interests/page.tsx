"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

type QueueEntry = { companyId:number; companyName:string; joinedAt:string; queueDays:number };
type Interest = { listingId:number; title:string; city:string; price:number; imageUrl?:string|null; companyName?:string|null; createdAt:string };

export default function QueuesAndInterestsPage() {
  const { token, ready } = useAuth();
  const [queues, setQueues] = useState<QueueEntry[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!token) { setErr('Du måste vara inloggad.'); return; }
    Promise.all([
      fetch('/api/queues/me', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }).then(r=>r.ok?r.json():[]),
      fetch('/api/interests/me', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }).then(r=>r.ok?r.json():[]),
    ]).then(([qs, is]) => { setQueues(qs || []); setInterests(is || []); })
    .catch(() => setErr('Kunde inte ladda data.'));
  }, [token, ready]);

  if (!ready) return <main className="container-page"><section className="section">Laddar…</section></main>;
  if (err) return <main className="container-page"><section className="section" style={{color:'crimson'}}>{err}</section></main>;

  return (
    <main className="container-page">
      <section className="section">
        <h1 className="h1 mb-6">Köer & intressen</h1>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="h2 mb-3">Mina köer</h2>
            {queues.length === 0 ? (
              <div className="card subtle">Du står inte i någon kö ännu.</div>
            ) : (
              <div className="grid gap-3">
                {queues.map(q => (
                  <article key={q.companyId} className="card shadow-soft flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{q.companyName}</div>
                      <div className="text-sm text-muted">Sedan: {new Date(q.joinedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted">Ködagar</div>
                      <div className="text-2xl font-semibold">{q.queueDays}</div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="h2 mb-3">Mina intressen</h2>
            {interests.length === 0 ? (
              <div className="card subtle">Du har inte skickat några intresseanmälningar ännu.</div>
            ) : (
              <div className="grid gap-3">
                {interests.map(i => (
                  <article key={i.listingId+':'+i.createdAt} className="card shadow-soft">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{i.title}</div>
                        <div className="text-sm text-muted">{i.city} · {i.companyName || '—'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted">Skickad</div>
                        <div className="text-sm">{new Date(i.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
