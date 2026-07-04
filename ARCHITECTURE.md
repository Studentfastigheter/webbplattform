# Arkitektur

Helhetsbild av CampusLyan-webbplattformen. För dagliga konventioner, se [DEVELOPMENT.md](DEVELOPMENT.md).

---

## Översikt

En enda Next.js-kodbas serverar tre ytor, åtskilda på route-nivå och (i produktion) på subdomän:

```
                        ┌─────────────────────────────┐
   campuslyan.se  ─────▶│  src/app/(site)   Publik     │
   portal.*       ─────▶│  src/app/portal   Företag    │──▶ src/features/* ──▶ src/lib/api/client.ts ──▶ Backend (/api)
   admin.*        ─────▶│  src/app/admin    Intern     │
                        └─────────────┬───────────────┘
                                      │
                              src/proxy.ts
                    (subdomän-routing, locale, CSP, gate)
```

`src/proxy.ts` (Next 16:s middleware) kör före allt: mappar subdomäner till rätt route-träd, väljer locale, sätter säkerhetsheaders och gate:ar skyddade ytor.

---

## Lagermodell

| Lager | Plats | Ansvar |
|-------|-------|--------|
| **Routes/vyer** | `src/app/**` | Tunn komposition. Server Components som default; `"use client"` vid interaktivitet. |
| **Features** | `src/features/<x>` | Domänlogik: komponenter, hooks (TanStack Query), services (API), typer. |
| **Delad UI** | `src/components/{ui,layout,shared,icons}` | Presentationskomponenter utan domänägare. |
| **Infrastruktur** | `src/lib/**`, `src/context`, `src/i18n` | API-klient, query-setup, auth, lokalisering, providers. |

Beroenderiktning: `app → features → lib`. Delad UI (`components`) beror aldrig på `features`.

---

## Dataflöde

1. En route/feature-komponent anropar en **feature-hook** (`src/features/<x>/hooks`).
2. Hooken använder **TanStack Query** med en nyckel från `qk.*` ([`src/lib/query/keys.ts`](src/lib/query/keys.ts)) och anropar en **feature-service**.
3. Servicen anropar **`apiClient`** ([`src/lib/api/client.ts`](src/lib/api/client.ts)), som lägger på auth, timeout och felnormalisering, och proxias `/api/*` → backend.
4. Servicen **normaliserar** svaret (via [`src/lib/api/normalize.ts`](src/lib/api/normalize.ts) + ev. mapper) till en frontendmodell.
5. Mutationer invaliderar rätt query-nycklar i `onSettled` så UI:t uppdateras.

Publika sidor prefetchar på servern och hydrerar via `PrefetchedQueryBoundary` ([`src/lib/query`](src/lib/query)).

---

## Auth-modell

- **Token** i `localStorage`, hanterad via [`src/lib/auth-storage.ts`](src/lib/auth-storage.ts).
- **Flagg-cookie `cl_auth=1`** sätts parallellt (aldrig tokenen) på apex-domänen, så `src/proxy.ts` kan avvisa anonyma anrop mot `portal.`/`admin.` serversidigt i produktion — innan sidskalet renderas.
- **Klientguardar** i `src/features/auth` är auktoritativa (cookien är bara en snabb grind).
- `AuthContext` rensar token endast vid 401/403; transienta fel behåller sessionen. In-/utloggning tömmer hela query-cachen (personliga nycklar är inte användarskopade).
- **Freja e-ID** (svensk e-legitimation) för studentverifiering: `src/app/(site)/register/freja-id`.

> **Känd begränsning:** token i `localStorage` är XSS-åtkomlig. Rätt lösning är httpOnly-cookie satt av backend; det kräver backend-ändring. Kompenseras av skärpt CSP i produktion (`src/proxy.ts`).

---

## Säkerhet

Centraliserat i [`src/proxy.ts`](src/proxy.ts):

- **CSP** — i produktion utan `unsafe-eval` och med nedskuren `connect-src`; `frame-ancestors 'none'`, `object-src 'none'`.
- **HSTS, X-Frame-Options: DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.**
- **Serversidig gate** för portal/admin (se Auth-modell).
- `portal.`/`admin.` sätts `noindex`.

**Bildoptimeraren** ([`next.config.ts`](next.config.ts)): `images.remotePatterns` tillåter **tillfälligt** alla värdar eftersom backend i vissa fall lagrar externa bild-URL:er. ⚠️ Detta är en öppen proxy/SSRF-yta — snäva in till backendens mediakatalog igen när backend normaliserat alla bilder till sin egen URL (backend-hosten står redan först i listan).

**Route handlers** (`src/app/api`): validerar indata och gör auktorisering serversidigt. Waitlisten är rate limitad och kräver service account i produktion.

---

## Designsystem

- **Tokens** i [`src/app/globals.css`](src/app/globals.css) `@theme` — ingen `tailwind.config.js` (Tailwind v4). Brand-grönt `--brand #004225` med en `brand-25…900`-skala; använd token-klasser (`bg-brand`, `text-brand-500`), aldrig hex-literaler.
- **Primitiver:** shadcn/ui (new-york) ovanpå Radix (`radix-ui`-metapaketet) i `src/components/ui`.
- **Typografi:** Geist / Geist Mono / Outfit via `next/font`.
- **Tema:** låst till ljust läge (`color-scheme: light`).
- **Ikoner:** allt går genom [`src/components/icons`](src/components/icons) → Material Symbols (även lucide-/tabler-alias mappas dit) så ikonuppsättningen är enhetlig.
- **Diagram:** en delad palett i [`src/features/analytics/chart-palette.ts`](src/features/analytics/chart-palette.ts), förankrad i brand-tokens.

Portalen bygger på ett re-skinnat TailAdmin-skelett; admin-verktygen ligger i [`src/app/admin/_components/tools`](src/app/admin/_components/tools) som ett tunt `next/dynamic`-router-skal (`AdminTools.tsx`) + `shared.tsx` + en modul per sektion under `sections/` — så varje admin-route bara laddar sin egen sektion.

---

## Rendering & routing

- **Server Components** som default; opt-in `"use client"` för interaktivitet.
- **Route groups:** `(site)`, `(site)/(ads)` (annonskolumner). `_`-prefixade mappar är icke-routbara.
- **Lokalisering:** `sv` (default) och `en` via `/en`-prefix, hanterat i `src/proxy.ts` + `src/i18n`.
- **Legacy-redirects** (svenska → engelska slugs) i [`next.config.ts`](next.config.ts).

---

## Kvalitetsinfrastruktur

- **Typecheck:** `tsc --noEmit`, `strict`.
- **Lint:** ESLint 9 flat config ([`eslint.config.mjs`](eslint.config.mjs)) med `eslint-config-next` (core-web-vitals + typescript).
- **Test:** Vitest — enhetstester nära koden (`*.test.ts`), t.ex. `src/lib/api/*.test.ts`, `src/lib/rich-text.test.ts`.
- **CI:** [.github/workflows/ci.yml](.github/workflows/ci.yml) kör typecheck + lint + test + build på push/PR.

---

## Att känna till

- **Backend-kontrakt är heliga** — ändra inte endpointnamn/payloads ensidigt. Backend-repot är referens.
- **Designsystem-synk** (`.design-sync/`) refererar komponenter som togs bort vid UI-konsolideringen — behöver en re-sync.
- **Bild-`remotePatterns`** ska snävas in igen (se Säkerhet).
