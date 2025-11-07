"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");

  return (
    <form
      className="mt-4 grid gap-2 sm:grid-cols-[1fr_240px_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (city.trim()) params.set("city", city.trim());
        router.push(`/listings${params.toString() ? `?${params.toString()}` : ""}`);
      }}
    >
      <input
        className="input"
        placeholder="Sök efter område, typ, titel…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <input
        className="input"
        placeholder="Stad (valfritt)"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button className="btn btn-primary" type="submit">Sök bostäder</button>
    </form>
  );
}

