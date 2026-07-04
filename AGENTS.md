# AGENTS.md

Guide för AI-kodningsagenter (Claude Code, GitHub Copilot m.fl.) som arbetar i detta repo. Håll den kort och korrekt. För djupare detaljer: [README.md](README.md), [DEVELOPMENT.md](DEVELOPMENT.md), [ARCHITECTURE.md](ARCHITECTURE.md).

## Vad det är

Frontend för **CampusLyan**, en svensk studentbostadsplattform. En Next.js-kodbas, tre ytor: **publika sajten** (`src/app/(site)`), **företagsportalen** (`src/app/portal`), **admin** (`src/app/admin`). Subdomän-routing/säkerhet i [`src/proxy.ts`](src/proxy.ts).

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 5 (strict, isolatedModules) · Tailwind CSS v4 (tokens i `src/app/globals.css` `@theme`, **ingen** `tailwind.config.js`) · shadcn/ui + Radix (`radix-ui`-metapaketet) · TanStack Query 5 · `motion` · Recharts · Leaflet · sonner.

En UI-stack. **Inte** installerat/utfasat: HeroUI, Material Tailwind, react-aria, @radix-ui/themes, framer-motion, individuella `@radix-ui/react-*`-paket.

## Kommandon (kör före merge)

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint 9
npm run test        # Vitest
npm run build       # produktionsbygge (när routes/config ändrats)
```

Alla fyra ska vara gröna; de körs även i CI. Dev: `npm run dev` (http://localhost:3000).

## Regler som gäller allt

1. **Tunna route-filer.** Logik/UI → `src/features/<x>` eller `src/components`. Route-filer komponerar bara.
2. **Allt backend-data via `apiClient`** ([`src/lib/api/client.ts`](src/lib/api/client.ts)). Aldrig `fetch` direkt i komponenter (undantag: `src/app/api`-handlers och icke-CampusLyan-tredjeparter).
3. **TanStack Query-nycklar** kommer alltid från `qk.*` ([`src/lib/query/keys.ts`](src/lib/query/keys.ts)). Mutationer invaliderar i `onSettled`.
4. **Brand-färg via tokens** (`bg-brand`, `text-brand-500`), aldrig `[#004225]`. Diagramfärger från [`src/features/analytics/chart-palette.ts`](src/features/analytics/chart-palette.ts).
5. **Bekräftelser:** `useConfirmDialog` ([`src/components/ui/confirm-dialog.tsx`](src/components/ui/confirm-dialog.tsx)). Aldrig `window.confirm`/`alert`.
6. **Lokalisera all text** (sv/en) via `t()` eller `localizedText(locale, sv, en)`.
7. **Ljust tema.** Ingen ny dark-mode-logik.
8. **Bevara backend-kontrakt.** Ändra inte endpointnamn/payloads ensidigt.
9. **Server Components som default.** `"use client"` bara vid interaktivitet; guarda browser-API:er.

## Var saker bor

| Behöver du… | Titta i |
|-------------|---------|
| API-klient, felhantering, normalisering | `src/lib/api/{client,normalize}.ts` |
| Query-setup & nycklar | `src/lib/query/` |
| Auth (token, cookie, guardar) | `src/lib/auth-storage.ts`, `src/context/AuthContext.tsx`, `src/features/auth` |
| Feature-logik | `src/features/<x>/{components,hooks,services}` |
| UI-primitiver | `src/components/ui` |
| Ikoner | `src/components/icons` (Material Symbols) |
| Middleware/säkerhet/routing | `src/proxy.ts` |
| Designtokens | `src/app/globals.css` (`@theme`) |
| Admin-sektioner | `src/app/admin/_components/tools/{shared.tsx,sections/}` |

## Fallgropar

- **PowerShell på Windows** läser UTF-8 som Windows-1252 vid sök/ersätt → mojibake + BOM i svenska strängar. Använd redigeringsverktyg, inte `sed`/PS-textmanipulering, på källfiler. Verifiera diffen.
- **Admin kräver inloggning** och kan inte klicktestas utan backend. Verifiera admin-ändringar med typecheck + build (kompilerar alla admin-routes).
- **CSP `upgrade-insecure-requests`** blockerar chunk-laddning på icke-`localhost`-http-hostar. Testa admin-subdomänen via `admin.localhost` (Chrome litar på `.localhost`).
- **Rich text:** avkoda `clrt:v1:`-blobbar på läsvägen, koda **inte** på skrivvägen.
- **Bild-`remotePatterns`** tillåter tillfälligt alla värdar (backend lagrar externa URL:er) — snäva in igen senare; det är en känd SSRF-yta.

## Branch- & commit-konventioner

- Arbeta på egen branch från integrationsgrenen; håll PR:er fokuserade.
- Commit-meddelanden: koncisa, imperativa, gärna `typ(område): beskrivning`.
- Kör kvalitetsgrindarna innan du föreslår merge.

## Om du uppdaterar den här filen

Håll den kort och korrekt. Bevara fil-referenserna. Lägg bara till konventioner som faktiskt gäller, med sökväg och en rads motivering.
