import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "node",
    // src/lib/api/client.ts kastar vid import om NEXT_PUBLIC_API_URL saknas —
    // testerna ska aldrig vara beroende av .env.local.
    env: {
      NEXT_PUBLIC_API_URL: "http://localhost:8080/api",
    },
  },
});
