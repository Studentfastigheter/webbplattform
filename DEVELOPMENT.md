# Utvecklingsguide

Konventioner och mönster för att utveckla CampusLyan-webbplattformen vidare. Läs [ARCHITECTURE.md](ARCHITECTURE.md) för helhetsbilden och [AGENTS.md](AGENTS.md) för en kompakt agent-/onboardingversion.

---

## Grundprinciper

1. **Tunna route-filer.** Filer i `src/app` komponerar vyer — de innehåller inte affärslogik. Flytta återanvändbar UI/logik till `src/features/<feature>` eller `src/components`.
2. **En UI-stack.** shadcn/ui + Radix (`radix-ui`-metapaketet) + Tailwind v4. Inga nya beroenden på HeroUI, Material Tailwind, react-aria eller @radix-ui/themes — de är utfasade.
3. **Allt backend-data via `apiClient`.** Se nedan.
4. **Bevara backend-kontrakt.** Ändra inte endpointnamn eller payloads i frontend utan att backend ändras samtidigt.
5. **Lokalisera all UI-text** (sv/en) — se [i18n](#i18n).
6. **Ljust tema.** Sajten är låst till ljust läge. Skriv inte ny dark-mode-logik.

---

## Katalogstruktur

- `src/app` – routes, layouts, route groups och Next route handlers.
  - `(site)` – publika sajten. `(site)/(ads)` = sidor med annonskolumner.
  - `portal` – företagsportalen. `admin` – intern admin. `_components`/`_config`/`_statics` = icke-routbara hjälpmappar.
  - `api` – Next route handlers (t.ex. `api/waitlist`, `api/admin`).
- `src/features/<feature>` – feature-ägd `components/`, `hooks/`, `services/`, och feature-lokala typer.
- `src/components/ui` – shadcn/Radix-primitiver (button, dialog, select, confirm-dialog …).
- `src/components/layout` – global layout och navigation (header, footer).
- `src/components/shared` – delade komponenter som ingen feature äger (t.ex. kartor).
- `src/components/icons` – centraliserat ikonsystem (alla ikoner → Material Symbols).
- `src/lib` – delade helpers som inte är feature-specifika (`api/`, `query/`, `auth-storage.ts`, `utils.ts`, `seo.ts` …).
- `src/context` – globala providers (`AuthContext`, `UserEnvironmentContext`).
- `src/types` – delade kontrakt. `src/types/api` = generiska API-typer (t.ex. paginering). Feature-specifika typer bor nära featuren.

> Not: `src/types` innehåller i dag både backend-DTO:er och frontendmodeller. Dela upp gradvis när respektive feature utvecklas — lägg nya feature-typer i featuren, inte här.

---

## API-anrop

**Alla** anrop till CampusLyan-backend går via [`src/lib/api/client.ts`](src/lib/api/client.ts) (`apiClient`). Komponenter anropar inte backend direkt — undantag är Next route handlers i `src/app/api` och tredjepartsanrop som inte går mot CampusLyan-backend.

Feature-services ligger under respektive feature, t.ex.:

- `src/features/auth/services/auth-service.ts`
- `src/features/listings/services/listing-service.ts`
- `src/features/queues/services/queue-service.ts`
- `src/features/companies/services/company-service.ts`
- `src/features/documents/services/document-service.ts`
- `src/features/notifications/services/notification-service.ts`

`apiClient` ansvarar för:

- Normalisering av `NEXT_PUBLIC_API_URL` (bas som slutar med `/api`).
- `Authorization: Bearer <token>` (token från `auth-storage`, se nedan).
- JSON/form-data-headers.
- **30 s timeout** via kombinerad `AbortSignal` (anroparens abort vinner alltid).
- Konsekvent felhantering: allt kastas som `ApiError` (även nätverksfel/timeout → `status 0`), med lokaliserade svenska statusmeddelanden.
- Querystring- och pathsegment-helpers (`buildQuery`, `pathSegment` — injektionssäkra).

**Normalisering av svar:** delade helpers finns i [`src/lib/api/normalize.ts`](src/lib/api/normalize.ts) (`isRecord`, `firstNonEmptyString`, `firstFiniteNumber`). Om backend-formen ≠ UI-behovet, skriv en mapper i feature-servicen och låt komponenten konsumera frontendmodellen.

> **Rich text:** `apiClient` avkodar äldre `clrt:v1:`-blobbar på läsvägen ([`src/lib/rich-text.ts`](src/lib/rich-text.ts)) men **kodar inte längre på skrivvägen** — ny data sparas som ren text.

---

## Serverdata: TanStack Query

- **En** `QueryClient` skapas i [`src/lib/query/QueryProvider.tsx`](src/lib/query/QueryProvider.tsx). Defaults i [`create-query-client.ts`](src/lib/query/create-query-client.ts): `staleTime 30s`, `gcTime 5m`, `refetchOnWindowFocus: false`. **Retry skippar alla 4xx** (deterministiska fel); 5xx/nätverk får en retry.
- **Query keys:** använd alltid nyckelfabriken i [`src/lib/query/keys.ts`](src/lib/query/keys.ts) (`qk.*`). Skapa aldrig ad-hoc-nyckelarrayer. Nycklar är hierarkiska så prefix-invalidering fungerar (`qk.listings.all` invaliderar allt, `qk.listings.detail(id)` bara en).
- **Mutationer äger sin invalidering** i `onSettled` (inte `onSuccess` — så cachen uppdateras även efter misslyckad skrivning). Anropande komponent skickar bara per-call `onSuccess`/`onError`.
- **Personliga nycklar är inte användarskopade** → `queryClient.clear()` körs vid in- och utloggning (se `AuthContext`).
- Feature-hooks ligger i `src/features/<feature>/hooks`. `enabled`-guards krävs för nycklar som kan vara null vid första render.

---

## Autentisering

- Token lagras via [`src/lib/auth-storage.ts`](src/lib/auth-storage.ts) (`getStoredAuthToken`/`setStoredAuthToken`) i `localStorage`. Vid sidan sätts en **flagg-cookie `cl_auth=1`** (aldrig själva tokenen) på apex-domänen.
- `src/proxy.ts` använder `cl_auth` för att avvisa anonyma anrop mot `portal.`/`admin.`-subdomänerna **serversidigt** i produktion, innan sidan renderas. Klientguardarna i `src/features/auth` är fortfarande auktoritativa.
- `AuthContext` rensar token **endast** vid 401/403 — nätverksfel/5xx vid sidladdning loggar inte ut användaren.
- Freja e-ID-flödet finns i `src/app/(site)/register/freja-id`.

---

## UI-mönster att återanvända

- **Bekräftelsedialoger:** använd `useConfirmDialog` från [`src/components/ui/confirm-dialog.tsx`](src/components/ui/confirm-dialog.tsx). Använd **aldrig** `window.confirm`/`alert` — hela appen är fri från dem.
- **Toaster:** `import { toast } from "sonner"` för info/success/error.
- **Knappar:** `Button` från `src/components/ui/button` — stödjer `variant`, `size`, `isLoading`, `isDisabled`, `onPress` och polymorf `as`/`href`.
- **Diagram:** hämta färger från [`src/features/analytics/chart-palette.ts`](src/features/analytics/chart-palette.ts) (`CHART_PRIMARY`, `CHART_CATEGORICAL` …). Hårdkoda inte hex.
- **Brand-färg:** använd token-klasser (`bg-brand`, `text-brand`, `bg-brand-500` …), inte `[#004225]`-literaler.
- **Fel/laddning:** varje yta har en `error.tsx`; root har `global-error.tsx`. Ytdata får `loading.tsx`/skeletons där det behövs.

---

## i18n

Lokalisera all synlig text. Två mekanismer används:

- **Dictionaries** i `src/i18n/dictionaries/{sv,en}.json` via `t("nyckel")`.
- **Inline-par** via `localizedText(locale, "svenska", "english")` för punktuell text.

`locale` kommer från `useI18n()`. Datum/tal formateras alltid med explicit locale (`numberLocale(locale)` / `sv-SE`) för att undvika hydration-mismatch.

---

## Typer

- API request/response: feature-lokal `types`-fil, eller `src/types/api` om typen är generisk.
- Domän-/frontendmodell: nära featuren.
- Delade primitiver: `src/types/common.ts`. UI-only: `src/types/ui.ts`.

---

## Ny feature

```text
src/features/<feature>/
  components/
  hooks/
  services/
  types/
```

Lägg bara feature-ägd kod här. Används något brett flyttas det till `components`, `lib` eller `types`.

---

## Google AdSense

Publisher-ID ligger i root-layoutens metadata; scriptet laddas globalt. Annonsytorna använder endast Google AdSense (slots i [`src/components/layout/AdColumnsLayout.tsx`](src/components/layout/AdColumnsLayout.tsx)) — plattformen hämtar inte egna annonser. Tomma ytor renderas osynliga (ingen platshållarbox).

---

## Miljövariabler

| Variabel | Krävs | Beskrivning |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | Ja | Backend-bas (normaliseras till `.../api`). |
| `NEXT_PUBLIC_PLATFORM_LAUNCHED` | Nej | `true` öppnar hela plattformen (annars pre-launch). |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Prod (waitlist) | Service account för Firestore-waitlist. |
| `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | Alt. | Uppdelad service account. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` / `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Endast dev | Publik Firestore-fallback (blockerad i produktion). |

Waitlisten sparas via `src/app/api/waitlist` (rate limitad). I dev kan den falla tillbaka på `data/waitlist.local.json`; i produktion krävs service account.

---

## Kvalitet & arbetssätt

- Kör `npm run typecheck`, `npm run lint` och `npm run test` innan merge. Kör `npm run build` när route- eller Next-konfiguration ändrats.
- ESLint ([`eslint.config.mjs`](eslint.config.mjs)): sju regler är tillfälligt `warn` med en dokumenterad nedtrappningsplan i filen — betar av per fil som rörs, promoveras sedan till `error`.
- Verifiera beteende, inte bara typer, för UI-ändringar (t.ex. skärmdumpar via Playwright mot `npm start`).
- Undvik barrel-exports om importen blir otydligare.
