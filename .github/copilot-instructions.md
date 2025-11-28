<!-- Auto-generated guidance for AI coding agents working on this repo. -->
# Copilot instructions for this repository

Purpose
- Help AI agents become productive quickly by highlighting project-specific patterns, commands, and integration points.

Quick start (developer commands)
- **Run dev server:** `npm run dev` (uses Turbopack; app available at `http://localhost:3000`).
- **Build:** `npm run build` (Turbopack-enabled production build).
- **Start:** `npm run start`.
- **Node/npm versions:** The repo declares `node: 20.x` and `npm: 10.x` in `package.json`.

Big-picture architecture
- This is a Next.js App Router project (see the `app/` directory). Pages and layouts are organized with nested `layout.tsx` and `page.tsx` files.
- The app uses Server Components by default. Interactive components must opt-in with `"use client"` at the top of the file.
- UI is split across two locations:
  - `components/` — shared UI and presentational components (Landing, Header, Footer, etc.).
  - `app/(business_portal)/_components` and `app/(business_portal)/_pages` — internal portal components and pages. Leading underscores are a project convention indicating internal/private groupings.
- Context and small libraries live in `context/` and `lib/` (e.g., `context/AuthContext.tsx`, `lib/api.ts`).

Important conventions & patterns
- Grouping segments: Folder names wrapped in parentheses (e.g. `(business_portal)` and `(site)`) are used to group routes in the App Router — preserve this structure when moving files.
- Internal folders start with an underscore (e.g. `_components`, `_pages`, `_statics`) — treat these as non-routable helper dirs.
- Authentication: `context/AuthContext.tsx` uses an `apiFetch` helper from `lib/api.ts`, stores token in `localStorage` under `auth_token`, and expects backend auth endpoints under `/api/*`. Example call:
  - `apiFetch<LoginResp>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })`
- API proxying: `next.config.ts` rewrites `/api/:path*` to `http://localhost:8080/api/:path*` for local development — a backend running on port `8080` is expected for full integration.
- Images: `next.config.ts` contains `images.remotePatterns` that whitelist external image hosts — prefer these hosts or update config when adding new remote images.
- Styling: Tailwind CSS is used (`tailwind.config.js`, `globals.css`). Follow existing utility classes and `class-variance-authority` patterns.

Dependencies & third-party platforms
- Notable libraries: `@tanstack/react-table`, `@radix-ui/*`, `framer-motion`, `leaflet` (maps), `@heroui/*` components. When adding components follow the repo's composition style (small presentational components + container components in app pages).

Development tips
- When converting a server component to client-side interactive code, add `"use client"` at the top and ensure browser-only APIs (like `localStorage`) are guarded.
- Because `/api` is proxied to `localhost:8080`, run the backend or mock endpoints to avoid failing API calls while developing interactive flows.
- The app uses the Next.js App Router semantics — prefer `layout.tsx` for shared wrappers and `page.tsx` for routes. Avoid moving route files out of the folder structure or renaming grouping parentheses.
- For auth flows, check `context/AuthContext.tsx` to understand token storage and retrieval; reusing `apiFetch` helps keep headers consistent.

Files to inspect when unsure
- `package.json` — scripts, engines and major dependencies.
- `next.config.ts` — rewrites, redirects, and image domains.
- `app/layout.tsx` and `app/(business_portal)/portal/layout.tsx` — global layout and portal layout patterns.
- `context/AuthContext.tsx` and `lib/api.ts` — auth, token usage, and API helper patterns.
- `components/` and `app/(business_portal)/_components/` — examples for composing UI.

What not to change without confirming
- Do not rename grouping folders with parentheses (e.g. `(business_portal)`) or remove `_components` / `_pages` prefixes without coordinating — these reflect route grouping and internal organization.
- Do not change the `/api` rewrite target in `next.config.ts` unless you update developer docs and confirm the backend URL.

If you update this file
- Keep it short. Preserve examples and references to concrete files above. If you add new conventions, include file paths and a one-line rationale.

Questions for the maintainers
- Is there a local backend repo or a docker/dev script to run the API on `localhost:8080`? Add instructions here if available.
- Are there any CI checks or commit hooks not discoverable in the repo tree that we should call out?

— End of guidance —

**GitHub / Contribution**
- **Branching:** Use short, descriptive branches such as `feature/<ticket>-short-desc`, `fix/<ticket>-short-desc`, or `chore/<area>`; create the branch off the repository's default branch (commonly `main`).
- **Pull Requests:** Open a focused PR with a clear title and description that explains the change, why it's needed, and how to test it locally. Include screenshots for UI changes and links to relevant issue/ticket IDs.
- **Local checks before PR:** Run the dev server and a production build check:
  - `npm run dev` (development)
  - `npm run build` (verify production build)
  - Fix any build errors before pushing.
- **CI & checks:** No repository-wide CI config was discovered in the repo scan. If your project has CI (GitHub Actions, etc.), ensure it passes; otherwise, run `npm run build` locally and verify functionality.
- **Code review:** Keep changes small and focused; add reviewers familiar with the area. If there are code owners or team labels, follow those conventions.
- **Commit messages:** Use imperative, concise messages (e.g., `Add login to AuthContext`, `Fix typo in Header`).
- **When in doubt:** Ask maintainers for the preferred PR template, reviewer list, or any automated checks we should run.
