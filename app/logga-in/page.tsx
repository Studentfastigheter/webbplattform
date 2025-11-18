"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/button';

export default function LoginPage() {
  const { login, ready } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!ready) return <main className="container-page"><p>Laddar...</p></main>;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push('/listings');
    } catch (e: any) {
      setErr(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container-page">
      <section className="section" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 className="h1 mb-4">Logga in</h1>
        <form onSubmit={onSubmit} className="form card shadow-soft">
          <div className="fieldset">
            <label className="label">E‑post</label>
            <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div className="fieldset">
            <label className="label">Lösenord</label>
            <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <Button
            type="submit"
            color="success"
            className="mt-2 font-semibold"
            isDisabled={loading}
            isLoading={loading}
          >
            {loading ? "Loggar in…" : "Logga in"}
          </Button>
        </form>
        {err && <p className="subtle" style={{ color: 'crimson', marginTop: 12 }}>{err}</p>}
      </section>
    </main>
  );
}
