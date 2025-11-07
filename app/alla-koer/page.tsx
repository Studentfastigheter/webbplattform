"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import RelevantQueues from "@/app/components/Queues/RelevantQueues";

type Company = { id: number; name: string };

export default function AllQueuesPage() {
  const { token, user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [joinMsg, setJoinMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/companies", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Kunde inte ladda företag"))))
      .then((data) => setCompanies(data || []))
      .catch((e) => setError(e.message || "Något gick fel"))
      .finally(() => setLoading(false));
  }, []);

  const joinQueue = async (companyId: number) => {
    if (!token) return;
    setJoiningId(companyId);
    setJoinMsg(null);
    try {
      const res = await fetch(`/api/queues/join?companyId=${companyId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
      setJoinMsg("Du står nu i denna kö.");
    } catch (e: any) {
      setJoinMsg(e.message || "Kunde inte gå med i kön");
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <main className="container-page">
      <section className="section space-y-4">
        <h1 className="h1">Våra köer</h1>
        <p className="text-muted max-w-2xl">
          Här hittar du alla bostadsköer vi erbjuder. Klicka in på en kö för att läsa mer och se aktuella annonser.
        </p>

        {loading && <div>Laddar…</div>}
        {error && <div style={{ color: "crimson" }}>{error}</div>}

        {!loading && !error && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => (
              <article key={c.id} className="card shadow-soft flex items-center justify-between">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-sm text-muted">Kö ID: {c.id}</div>
                </div>
                <div className="flex items-center gap-2">
                  {user ? (
                    <button
                      className="btn btn-outline"
                      disabled={joiningId === c.id}
                      onClick={() => joinQueue(c.id)}
                    >
                      {joiningId === c.id ? "Lägger till…" : "Gå med"}
                    </button>
                  ) : null}
                  <Link className="btn btn-primary" href={`/alla-koer/${c.id}`}>
                    Läs mer
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {joinMsg && <div className="text-brand">{joinMsg}</div>}
      </section>

      <section className="section space-y-3">
        <RelevantQueues />
      </section>
    </main>
  );
}
