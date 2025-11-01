export default async function TestPage() {
    const res = await fetch("/api/health", { cache: "no-store" });
    const text = await res.text();
  
    return (
      <main style={{ padding: 40 }}>
        <h1>Backend Test</h1>
        <p>Response from backend:</p>
        <pre>{text}</pre>
      </main>
    );
  }