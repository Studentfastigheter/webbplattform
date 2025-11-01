// app/test/page.tsx
"use client";
import { useEffect, useState } from "react";

export default function TestPage() {
  const [text, setText] = useState("...");

  useEffect(() => {
    fetch("/api/health").then(r => r.text()).then(setText).catch(e => setText(String(e)));
  }, []);

  return (
    <main style={{ padding: 40 }}>
      <h1>Backend Test</h1>
      <pre>{text}</pre>
    </main>
  );
}