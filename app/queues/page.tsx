"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

type QueueEntry = {
  companyId: number;
  companyName: string;
  joinedAt: string;
  queueDays: number;
};

export default function QueuesPage() {
  const { token, ready } = useAuth();
  const [items, setItems] = useState<QueueEntry[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!token) { setErr('Du måste vara inloggad.'); return; }
    fetch('/api/queues/me', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      .then(r => r.ok ? r.json() : r.text().then(t => Promise.reject(new Error(t || r.statusText))))
      .then(setItems)
      .catch(e => setErr(e.message));
  }, [token, ready]);

  if (!ready) return <main className="container-page"><section className="section">Laddar…</section></main>;
  if (err) return <main className="container-page"><section className="section" style={{color:'crimson'}}>{err}</section></main>;

  return (
    <main className="container-page">
      <section className="section">
        <h1 className="h1 mb-4">Mina köer</h1>
        {items.length === 0 ? (
          <p className="subtle">Du står inte i någon kö ännu.</p>
        ) : (
          <div className="grid gap-3">
            {items.map((q) => (
              <article key={q.companyId} className="card shadow-soft flex items-center justify-between">
                <div>
                  <div className="font-semibold">{q.companyName}</div>
                  <div className="text-muted text-sm">Sedan: {new Date(q.joinedAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted">Ködagar</div>
                  <div className="text-2xl font-semibold">{q.queueDays}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

