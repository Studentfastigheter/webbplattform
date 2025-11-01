"use client";

import { useEffect, useState } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { useAuth } from '@/context/AuthContext';

type Row = { companyId:number; companyName:string; userQueueDays?: number | null; listingsCount: number };

export default function RelevantQueues() {
  const { school } = useSchool();
  const { token, user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!school?.id) { setRows([]); return; }
    fetch(`/api/schools/${school.id}/queues`, { cache: 'no-store', headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      .then(r => r.ok ? r.json() : [])
      .then(setRows)
      .catch(() => setRows([]));
  }, [school?.id, token]);

  if (!school) return null;
  if (rows.length === 0) return (
    <section className="space-y-2">
      <h3 className="h2">Relevanta köer för {school.name}</h3>
      <div className="text-sm text-muted">Inga köer hittades nära den valda skolan ännu.</div>
    </section>
  );

  return (
    <section className="space-y-3">
      <h3 className="h2">Relevanta köer för {school.name}</h3>
      {user && (
        <div>
          <button
            className="btn btn-primary"
            onClick={async () => {
              if (!token) return;
              await fetch(`/api/queues/join-all?schoolId=${school.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            }}
          >
            Gå med i alla köer nära skolan
          </button>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <article key={r.companyId} className="card shadow-soft flex items-center justify-between">
            <div>
              <div className="font-semibold">{r.companyName}</div>
              <div className="text-sm text-muted">Annonser nära skolan: {r.listingsCount}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted">Dina ködagar</div>
              <div className="text-2xl font-semibold">{r.userQueueDays ?? 0}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
