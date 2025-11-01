"use client";

import { useEffect, useState } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { useAuth } from '@/context/AuthContext';

type School = { id: number; name: string; city?: string };

export default function SchoolSelector() {
  const { school, setSchool } = useSchool();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const url = query ? `/api/schools?q=${encodeURIComponent(query)}` : '/api/schools';
    fetch(url, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then((rows: any[]) => { if (active) setOptions(rows as School[]); })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [query]);

  if (!user) {
    return (
      <div className="card shadow-soft">
        <div className="font-semibold mb-2">Välj skola</div>
        <div className="text-sm text-muted">Logga in för att välja skola och få personliga förslag och köer.</div>
      </div>
    );
  }

  return (
    <div className="card shadow-soft">
      <div className="font-semibold mb-2">Välj skola</div>
      <div className="grid gap-2">
        <input className="input" placeholder="Sök skola (t.ex. KTH)" value={query} onChange={e=>setQuery(e.target.value)} />
        <div className="grid sm:grid-cols-3 gap-2">
          {options.map(opt => (
            <button key={opt.id} className={`btn ${school?.id===opt.id? 'btn-primary':'btn-outline'}`} onClick={()=>setSchool(opt)}>
              {opt.name}
            </button>
          ))}
        </div>
        {school && <div className="text-sm text-muted">Vald skola: <b>{school.name}</b></div>}
        {loading && <div className="text-sm text-muted">Laddar…</div>}
      </div>
    </div>
  );
}
