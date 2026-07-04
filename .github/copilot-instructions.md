<!-- Guidance for AI coding agents. The source of truth is AGENTS.md at the repo root. -->
# Copilot-instruktioner

> **Läs [`AGENTS.md`](../AGENTS.md) först** — den är den auktoritativa agent-guiden. Denna fil är en kort spegling för GitHub Copilot. Se även [`README.md`](../README.md), [`DEVELOPMENT.md`](../DEVELOPMENT.md) och [`ARCHITECTURE.md`](../ARCHITECTURE.md).

## Snabbstart

```bash
npm run dev        # http://localhost:3000 (Turbopack)
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint 9
npm run test       # Vitest
npm run build      # produktionsbygge
```

Node `20.x` / npm `10.x`. Kör typecheck + lint + test + build före PR (samma som CI, `.github/workflows/ci.yml`).

## Arkitektur i korthet

- **Next.js 16 App Router.** Server Components som default; `"use client"` vid interaktivitet.
- **Tre ytor** i en kodbas: `src/app/(site)` (publikt), `src/app/portal` (företag), `src/app/admin` (internt). Subdomän-routing, locale och säkerhet i [`src/proxy.ts`](../src/proxy.ts).
- **Feature-lager:** `src/features/<x>/{components,hooks,services,types}`. Route-filer i `src/app` hålls tunna.
- **Delad UI:** `src/components/{ui,layout,shared,icons}`.

## Konventioner (viktigast)

- **Backend-data:** alltid via `apiClient` i [`src/lib/api/client.ts`](../src/lib/api/client.ts). Ingen `fetch` direkt i komponenter (undantag: `src/app/api`-handlers).
- **Serverdata:** TanStack Query 5. Nycklar från `qk.*` i [`src/lib/query/keys.ts`](../src/lib/query/keys.ts); mutationer invaliderar i `onSettled`.
- **Auth:** token via [`src/lib/auth-storage.ts`](../src/lib/auth-storage.ts) (`localStorage` + flagg-cookie `cl_auth`); guardar i `src/features/auth`; se `src/context/AuthContext.tsx`.
- **UI-stack:** shadcn/ui + Radix (`radix-ui`-metapaketet) + Tailwind v4. Tokens i [`src/app/globals.css`](../src/app/globals.css) `@theme` — **ingen** `tailwind.config.js`. Använd token-klasser (`bg-brand`), inte hex.
- **Bekräftelser:** `useConfirmDialog` — aldrig `window.confirm`/`alert`. Toaster: `sonner`.
- **Ikoner:** via [`src/components/icons`](../src/components/icons) (Material Symbols).
- **Lokalisera all text** (sv/en). **Ljust tema** — ingen ny dark mode.

## Utfasat — använd inte

HeroUI, Material Tailwind, react-aria, @radix-ui/themes, framer-motion, `tailwind.config.js`, individuella `@radix-ui/react-*`-paket. Alla är borttagna vid UI-konsolideringen.

## API-proxy

`next.config.ts` skriver om `/api/:path*` → backend (`NEXT_PUBLIC_API_URL`, normaliseras till `.../api`). Kör backend eller mocka endpoints för fulla flöden.

## Ändra inte utan att stämma av

- Route-grupperingar med parenteser (`(site)`, `(ads)`) eller `_`-prefixade mappar.
- `/api`-rewrite-målet i `next.config.ts`.
- Backend-kontrakt (endpointnamn/payloads).

## Om du uppdaterar den här filen

Håll den kort och synkad med `AGENTS.md`. Bevara fil-referenser; lägg bara till konventioner som faktiskt gäller, med sökväg och kort motivering.
