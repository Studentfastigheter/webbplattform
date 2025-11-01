"use client";

import { useState } from "react";

export default function CalcPage() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [op, setOp] = useState("add");
  const [result, setResult] = useState<string | number>("");

  async function calculate() {
    const res = await fetch(`/api/calc?a=${a}&b=${b}&op=${op}`);
    const text = await res.text();
    setResult(text);
  }

  return (
    <main style={{ padding: 40, display: "grid", gap: 20 }}>
      <h1>Miniräknare</h1>

      <input
        type="number"
        value={a}
        onChange={e => setA(e.target.value)}
        placeholder="Tal 1"
      />

      <input
        type="number"
        value={b}
        onChange={e => setB(e.target.value)}
        placeholder="Tal 2"
      />

      <select value={op} onChange={e => setOp(e.target.value)}>
        <option value="add">+</option>
        <option value="sub">-</option>
        <option value="mul">*</option>
        <option value="div">/</option>
      </select>

      <button onClick={calculate}>
        Beräkna
      </button>

      {result !== "" && (
        <h2>Resultat: {result}</h2>
      )}
    </main>
  );
}