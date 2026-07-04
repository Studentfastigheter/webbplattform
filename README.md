# CampusLyan – Webbplattform

Frontend för CampusLyan, en svensk studentbostadsplattform. Byggd med **Next.js 16 (App Router)**, **React 19**, **TypeScript** och **Tailwind CSS v4**. All kommunikation med CampusLyan-backend går genom ett samlat API-lager i [`src/lib/api`](src/lib/api).

Plattformen består av **tre ytor** i samma kodbas:

| Yta | Route-grupp | Subdomän (prod) | För vem |
|-----|-------------|-----------------|---------|
| **Publika sajten** | `src/app/(site)` | `campuslyan.se` | Studenter & besökare |
| **Företagsportalen** | `src/app/portal` | `portal.campuslyan.se` | Bostadsföretag |
| **Admin** | `src/app/admin` | `admin.campuslyan.se` | Intern personal |

Subdomän-routing, lokalisering och säkerhetsheaders hanteras centralt i [`src/proxy.ts`](src/proxy.ts) (Next 16:s middleware).

---

## Kom igång

```bash
npm install
npm run dev          # http://localhost:3000 (Turbopack)
```

Skapa `.env.local` med minst:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080   # normaliseras automatiskt till .../api
```

En backend på den adressen förväntas för fulla integrationsflöden — `/api/*` proxias dit (se [`next.config.ts`](next.config.ts)). Utan backend fungerar sidorna men datadrivna anrop faller tillbaka på fel-/tomtillstånd.

Fullständig lista över miljövariabler (waitlist/Firebase, launch-läge, m.m.) finns i [DEVELOPMENT.md](DEVELOPMENT.md#miljövariabler).

---

## Scripts

```bash
npm run dev          # Utvecklingsserver (Turbopack)
npm run build        # Produktionsbygge (Turbopack)
npm run start        # Kör produktionsbygget
npm run typecheck    # tsc --noEmit (strict)
npm run lint         # ESLint 9 (flat config)
npm run test         # Vitest (enhetstester)
npm run test:watch   # Vitest i watch-läge
```

**Kvalitetsgrindar före merge:** `typecheck` + `lint` + `test` + `build` ska vara gröna. Samtliga körs även i CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) på push och PR.

---

## Teknik

| Område | Val |
|--------|-----|
| Ramverk | Next.js 16 (App Router, Server Components som default) |
| Språk | TypeScript 5 (`strict`, `isolatedModules`, `moduleResolution: bundler`) |
| UI-primitiver | [shadcn/ui](https://ui.shadcn.com) (new-york) ovanpå Radix (`radix-ui`-metapaketet) |
| Styling | Tailwind CSS v4 — tokens i [`src/app/globals.css`](src/app/globals.css) `@theme` (ingen `tailwind.config.js`) |
| Serverdata | TanStack Query 5 ([`src/lib/query`](src/lib/query)) |
| Animation | `motion` (Framer Motion v12-API) |
| Diagram | Recharts — palett i [`src/features/analytics/chart-palette.ts`](src/features/analytics/chart-palette.ts) |
| Kartor | Leaflet / react-leaflet |
| Toaster | sonner |
| Ikoner | Material Symbols via [`src/components/icons`](src/components/icons) |

En enda UI-stack: HeroUI, Material Tailwind, react-aria och @radix-ui/themes har fasats ut. Använd shadcn/Radix + Tailwind i all ny kod.

---

## Struktur (översikt)

```text
src/
  app/
    (site)/        Publika sajten (startsida, login, faq, partners …)
    portal/        Företagsportalen (listings, ansökningar, analytics …)
    admin/         Intern admin (konton, städer, företag, väntelista …)
    api/           Next route handlers (waitlist, admin-proxy)
    layout.tsx     Root-layout (providers, fonter, metadata)
  features/<x>/    Feature-ägd kod: components / hooks / services / types
  components/
    ui/            shadcn/Radix-primitiver (button, dialog, select …)
    layout/        Header, footer, globala layout-delar
    shared/        Delade komponenter (t.ex. kartor)
    icons/         Centraliserat ikonsystem (Material Symbols)
  lib/
    api/           apiClient, ApiError, normalize-helpers
    query/         QueryClient, query-key-fabrik, hydration
    auth-storage.ts  Token + auth-flagg-cookie
    utils.ts       cn() m.m.
  context/         Globala providers (AuthContext, UserEnvironment)
  i18n/            Lokalisering (sv/en)
  types/           Delade API-/domän-/UI-typer
  data/            Statisk frontenddata
  proxy.ts         Middleware: subdomäner, locale, CSP, routeskydd
```

Detaljerade konventioner för nya features, API-anrop och typer: [DEVELOPMENT.md](DEVELOPMENT.md).
Arkitektur, dataflöde och designsystem: [ARCHITECTURE.md](ARCHITECTURE.md).
Riktlinjer för AI-agenter (Claude Code, Copilot m.fl.): [AGENTS.md](AGENTS.md).

---

## Launch-läge

Utan `NEXT_PUBLIC_PLATFORM_LAUNCHED` kör frontend i **pre-launch-läge**: bara ett fåtal publika sidor är nåbara på huvuddomänen. Den auktoritativa listan finns i [`src/lib/platform-launch.ts`](src/lib/platform-launch.ts) (`prelaunchPublicSitePathnames`).

Sätt `NEXT_PUBLIC_PLATFORM_LAUNCHED=true` och redeploya för att öppna hela plattformen — plattformsnavigation, publika bostads-/kösidor och studentlogin/registrering.

---

## Deploy

Byggs och körs som en vanlig Next.js-app (Vercel eller motsvarande). Node `20.x` / npm `10.x` (se `package.json` `engines`, `.nvmrc`). Sätt samtliga miljövariabler i hostingmiljön. `admin.`- och `portal.`-subdomänerna måste peka på samma deploy — [`src/proxy.ts`](src/proxy.ts) routar dem till rätt route-träd.
