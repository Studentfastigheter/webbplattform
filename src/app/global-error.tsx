"use client";

import { useEffect } from "react";

/**
 * Sista utvägen när själva root-layouten kraschar. Renderas UTAN globals.css
 * och utan providers — därför enbart inline-styles och ren HTML här.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global render error", error);
  }, [error]);

  return (
    <html lang="sv">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f6f9f7",
          color: "#16211b",
          fontFamily:
            "ui-sans-serif, -apple-system, 'Segoe UI', system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 420, padding: 24, textAlign: "center" }}>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#004225",
            }}
          >
            CampusLyan
          </p>
          <h1 style={{ margin: "0 0 12px", fontSize: 24, lineHeight: 1.2 }}>
            Något gick fel
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: 15, color: "#5c6d63" }}>
            Ett oväntat fel inträffade. Prova att ladda om sidan — om felet
            kvarstår, försök igen om en liten stund.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "10px 24px",
              borderRadius: 9999,
              border: "none",
              background: "#004225",
              color: "#ffffff",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Ladda om sidan
          </button>
        </div>
      </body>
    </html>
  );
}
