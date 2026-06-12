# Development Guide

## Struktur

Appen ar organiserad runt `src/`:

- `src/app`: routes, layouts, route groups och Next route handlers. Hall route-filer tunna och flytta ateranvandbar UI/logik till `features` eller `components`.
- `src/components/ui`: generella primitives, exempelvis buttons, inputs, dialogs och shadcn-liknande komponenter.
- `src/components/layout`: global layout och navigationskomponenter.
- `src/components/shared`: delade komponenter som inte ags av en specifik feature, exempelvis kartkomponenter.
- `src/features/<feature>`: feature-agda komponenter, services, hooks, schemas och typer.
- `src/lib/api`: gemensam backend-kommunikation.
- `src/types/api`: generiska backend/API-kontrakt, exempelvis paginering.
- `src/types/domain`: re-exports for domainmodeller som anvands av flera features.
- `src/types`: befintliga delade kontrakt. Dessa innehaller idag bade backend-DTO:er och frontendmodeller och bor delas upp gradvis nar respektive feature utvecklas.

## API-anrop

Alla anrop till CampusLyan-backend ska ga via `src/lib/api/client.ts`.

Feature-services ligger under respektive feature:

- `src/features/auth/services/auth-service.ts`
- `src/features/listings/services/listing-service.ts`
- `src/features/queues/services/queue-service.ts`
- `src/features/companies/services/company-service.ts`
- `src/features/documents/services/document-service.ts`
- `src/features/messages/services/message-service.ts`
- `src/features/notifications/services/notification-service.ts`

Komponenter ska normalt inte anropa backend direkt. Undantag ar Next route handlers i `src/app/api` och externa tredjepartsanrop som inte gar mot CampusLyan-backend.

API-klienten ansvarar for:

- normalisering av `NEXT_PUBLIC_API_URL`
- `Authorization: Bearer <token>`
- JSON/form-data headers
- konsekvent felhantering via `ApiError`
- querystring- och pathsegment helpers

## Google AdSense

Publisher-ID:t ligger i root-layoutens metadata och AdSense-scriptet laddas globalt.
De befintliga annonsrutorna anvander Google AdSense-slot `9241310200` om inget annat
ar konfigurerat.

Om olika AdSense-enheter behovs kan slot-ID:n bytas via publika env-vars:

```bash
NEXT_PUBLIC_GOOGLE_ADSENSE_PRIMARY_SLOT=
NEXT_PUBLIC_GOOGLE_ADSENSE_SECONDARY_SLOT=
```

Eller per placering:

```bash
NEXT_PUBLIC_GOOGLE_ADSENSE_TOP_SLOT=
NEXT_PUBLIC_GOOGLE_ADSENSE_LEFT_SLOT=
NEXT_PUBLIC_GOOGLE_ADSENSE_BOTTOM_SLOT=
NEXT_PUBLIC_GOOGLE_ADSENSE_RIGHT_SLOT=
```

Egna annonser fran `/api/ads` visas fore Google AdSense. Nar ingen egen annons finns
fylls rutan av den Google-slot som ar konfigurerad.

## Typer

Anvand denna uppdelning nar ny kod laggs till:

- API request/response: lagg i feature-specifik `types`-fil eller i `src/types/api` om typen ar generisk.
- Domain/frontend model: lagg nara featuren, eller i `src/types/domain` om flera features delar modellen.
- Shared primitives: lagg i `src/types/common.ts`.
- UI-only typer: lagg i `src/types/ui.ts`.

Om backend-responsen inte matchar vad UI:t behover, skapa en mapper i feature-servicen eller i `features/<feature>/mappers`. Lat komponenten konsumera den frontendmodell som mappen returnerar.

## Ny feature

Skapa exempelvis:

```text
src/features/students/
  components/
  hooks/
  services/
  types/
  schemas/
```

Placera endast kod dar som feature-ags av `students`. Om kod anvands brett, flytta den till `components`, `hooks`, `lib` eller `types`.

## Riktlinjer

- Bevara backend-kontrakt. Andra inte endpointnamn eller payloads i frontend utan att backend andras samtidigt.
- Hall route-filer korta. De ska komponera vyer, inte innehalla affarslogik.
- Undvik barrel exports om importen blir mindre tydlig.
- Kor `npm run typecheck` innan merge. Kor `npm run build` nar route- eller Next-konfiguration har andrats.
