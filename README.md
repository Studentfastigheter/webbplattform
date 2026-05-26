# CampusLyan Webbplattform

Next.js-app för CampusLyan-plattformen. Appen använder Next App Router och kommunicerar med backend via ett samlat API-lager i `src/lib/api`.

## Kom igang

```bash
npm install
npm run dev
```

Miljovariabeln `NEXT_PUBLIC_API_URL` maste finnas i `.env.local`. Vardet normaliseras automatiskt till en backend-bas som slutar med `/api`.

## Vanliga kommandon

```bash
npm run dev
npm run typecheck
npm run build
```

## Struktur

```text
src/
  app/          Next.js routes, layouts och route handlers
  components/   Delade UI-, layout- och designsystemkomponenter
  features/     Feature-agd UI, services och featurelogik
  lib/api/      API-klient, auth headers, query helpers och API-fel
  lib/          Delade helpers som inte ar feature-specifika
  types/        Delade API-, domain- och UI-typer
  hooks/        Generella React hooks
  context/      Globala providers
  data/         Statisk frontenddata
```

Se `DEVELOPMENT.md` for riktlinjer for nya features, API-anrop och typer.
