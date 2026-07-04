# design-sync notes — CampusLyan Design System

Project: `5c271bb9-1df7-4f53-9314-a33bb55588a2` (https://claude.ai/design/p/5c271bb9-1df7-4f53-9314-a33bb55588a2)

## Repo shape
- This is a **Next.js 16 app** (`package.json` name `nextjs`), NOT a published design-system package. There is no dist/ component build.
- The "design system" is the component library under `src/components/` (shadcn/ui-based primitives + custom CampusLyan components). Styling is Tailwind v4 + brand tokens in `src/app/globals.css`.
- Shape pinned to `package` with **synth entry** driven by a generated barrel.

## Build pipeline (cfg.buildCmd)
`node .design-sync/gen-entry.mjs && node .design-sync/compile-css.mjs`
1. **gen-entry.mjs** → `.design-sync/.cache/ds-entry.tsx`: re-exports every component in `src/components` (+ all 200 icons from `icons/index.tsx`) onto one module for `window.CampusLyan`. Handles `export default` (which `export *` drops) and cross-file name collisions (Button/Tooltip/TooltipTrigger: ui/ wins over base/). `cfg.entry` points at this file.
2. **compile-css.mjs** → `.design-sync/.cache/compiled.css`: compiles Tailwind v4 (`src/app/globals.css`) to a static stylesheet (~245 KB) via `@tailwindcss/postcss`. Components use utility classes but never import CSS, so this file carries BOTH the brand token layer AND every utility. `cfg.cssEntry` points at it. Both outputs are gitignored (regenerated each build).

## Scoping decisions
- **Cards**: curated to ~50 top-level components (see `cfg.componentSrcMap`). Compound subparts (DialogContent, SelectItem, …) and the 200 icons are on the global but do NOT each get a card (would be noise).
- **Excluded from the bundle** (in gen-entry EXCLUDE): `icons/catalog.tsx` (metadata), `shared/map/*` (leaflet, DOM-only — won't bundle into a static IIFE), `ui/sliders/Controlled_Range.tsx` (HeroUI slider).
- **Not carded** (still on global): shadcn-studio account-settings blocks, faq block, GoogleAdSenseUnit, ScrollToTop, LocalizedLink, ListFrame — app-specific / non-visual. Authorable on a later re-sync.

## Fonts
- Geist / Geist Mono / Outfit are loaded at runtime via `next/font/google` (no woff2 in the repo). `cfg.runtimeFontPrefixes` set to suppress `[FONT_MISSING]` initially; revisit whether to self-host for full brand fidelity.

## Build gotchas (fixed in gen-entry.mjs)
- **`process` shim**: React & other deps read `process.env` at module top-level; the converter only defines `process.env.NODE_ENV`. gen-entry emits `.cache/process-shim.mjs` and imports it FIRST in the barrel (ESM deps run in source order) so a `process` global exists before any re-export initializes. Without it the whole IIFE throws at init and `window.CampusLyan` is empty (`[BUNDLE_EXPORT] 51/51 not a component`).
- **Env placeholders**: `src/lib/api/client.ts` THROWS at import if `NEXT_PUBLIC_API_URL` is unset (imported transitively everywhere). The shim seeds non-secret placeholder `NEXT_PUBLIC_*` values so init validation passes. NOT real config — static previews make no network calls. If a new module starts validating another env var at import, add it to the shim's `__ph`.

## Provider needs (for authoring context-heavy components)
- ~10 components throw `useI18n must be used inside I18nProvider` (LanguageSwitcher, SiteHeader, SiteFooter, ShareDialog, etc.). 1 needs `useAuth`/AuthProvider (LoginForm/AuthCard flows), 1 needs the Next app router (`invariant expected app router to be mounted`).
- These will floor-card or need `cfg.provider` wiring (I18nProvider needs `initialLocale` + dictionary data — a `$ref` module). Simple primitives (Button, Card, Input, Tabs, …) need NO provider.

## Styling status
- Tailwind v4 + brand tokens confirmed applying (Button renders `--brand: #004225` green). 
- Fonts: Geist/Outfit fall back to system sans (no @font-face shipped). `runtimeFontPrefixes` suppresses `[FONT_MISSING]`. Consider self-hosting Geist+Outfit woff2 for full fidelity (polish item).

## Authoring conventions & gotchas (from wave 1)
- **Preview import**: `import { X } from 'campuslyan'` maps to `window.CampusLyan`. Compound subparts + all 200 icons are importable this way.
- **preview-rebuild does NOT recompile Tailwind** — it reuses the static `_ds_bundle.css` from a full `package-build`. Previews may only use utility classes already present there (i.e. classes used somewhere in `src/components`). For custom preview styling, use **inline styles** or the component's own classes; verify a class exists by grepping `ds-bundle/_ds_bundle.css` for the exact `.<class>{` rule (beware compound-selector false positives).
- **Light theme only**: capture renders light mode, where `--primary` is near-black. Checked checkboxes / pressed default toggles fill dark-gray, not brand green — correct DS behavior (green→primary only in dark theme).
- **UntitledUI token scale is undefined app-wide** (`fg-brand-primary`, `bg-quaternary`, `utility-brand-*`, `bg-brand-solid`, `text-fg-*`…). `@theme` in globals.css defines only `--color-brand-*`/success/error, so those classes don't compile. `src/components/{base,foundations,application}/**` (ProgressBar, FeaturedIcon, ButtonUtility, FileUpload) render faint — and these UI-kit components are NOT used in real app pages (unintegrated scaffolding). Fix at PREVIEW level with real utilities (`bg-brand-500` = #004225, `bg-muted`, `bg-emerald-500`) or inline styles — do NOT invent a token theme the app lacks. Floor if a component can't be made presentable. ProgressBar was fixed via its `className`/`progressClassName` props.
- **Static states**: Radix uncontrolled defaults (`defaultChecked`, `defaultPressed`, `defaultValue`, `defaultOpen`) render states without interaction. ToggleGroup REQUIRES `type="single"|"multiple"`.
- **Field subparts**: `Field, FieldLabel, FieldTitle, FieldDescription, FieldError, FieldContent, FieldGroup, FieldSet, FieldLegend, FieldSeparator`. Horizontal checkbox row uses `FieldTitle` inside `FieldContent`; `Field data-invalid="true"` drives red label+error.
- **Separator vertical** needs a definite parent height (else collapses to 0). **Loader** spinner is drawn via the `.loader` CSS class (label is visually hidden) — minimal but styled. Avoid `LoadingScreen` (forces `min-h-svh`).

## Authoring techniques (wave 2)
- **tailwind-merge last-wins**: both `cn` (ui) and `cx` (base/foundations) are tailwind-merge, so a `className` passed to a component reliably OVERRIDES its own conflicting utilities. This is how the UntitledUI-token components were rescued: `FeaturedIcon className="bg-brand-500"` + `icon={<Home style={{color:'#fff'}}/>}` (icons fill `currentColor`); `ButtonUtility className="text-gray-600"` + inline box-shadow ring; `FileUpload.DropZone className="bg-white border-2 border-dashed border-gray-300"`.
- **ScrollArea** needs `type="always"` (default `hover` hides the thumb in a static shot) + fixed height + overflowing content.
- **Navbar**: the exported `<Navbar>` wrapper is `position:fixed` + `hidden xl:flex` (hidden at the 900px capture width). Render `NavBody`/`NavItems` directly with `className="flex w-full max-w-none"` to un-hide.
- **ChartContainer**: recharts works — wrap in a fixed w/h div, override `aspect-video` with `aspect-auto h-full w-full`, inject bar color via `config={{key:{color:'#004225'}}}` → `<Bar fill="var(--color-key)">`. Import BarChart/Bar from `'recharts'`.
- **`ring-*` gray utilities are largely absent** from the bundle — use inline `box-shadow` for hairlines.
- **next/image is unusable in static capture** (optimizer 404s; public assets not served) unless `unoptimized` + a data-URI src. Prefer components' no-image fallbacks (EntityHero renders an initial-letter avatar when image props are omitted).

## Floored components (ship as honest floor cards — importable, no rich preview)
14 total. **Fully importable** on `window.CampusLyan` but no authored preview.

**Render-limited (2)** — can't capture statically:
- `CampusLyanBrandLink` — unconditionally renders `next/image` for `/campuslyan-logo.svg` (optimizer/public assets 404 in capture → broken-image glyph). Fixable by serving `public/` during capture or making the logo a data URI.
- `Toaster` — sonner renders into a fixed portal that never paints in the single-shot static capture (transient UI). Fixable only with an interaction-driven capture.

**App-coupled (12)** — these are **fully importable** on `window.CampusLyan` but have no authored preview because they can't render in a static, provider-less capture:
- **i18n-coupled (10)** — throw `useI18n must be used inside I18nProvider`, and **I18nProvider itself calls `usePathname()`** (needs the Next app router), so wiring it as `cfg.provider` isn't viable without mocking next/navigation: `AuthCard, ReadMoreComponent, ShareDialog, StatusTag, SwitchSelect, VerifiedTag, LanguageSwitcher, AdColumnsLayout, BannerImageCropDialog, SiteFooter`.
- **auth-coupled (1)** — `SiteHeader` (needs AuthProvider + firebase).
- **router-coupled (1)** — `LoginForm` (needs the Next app router mounted).

To richly preview these later: mock `next/navigation` (`usePathname`/`useRouter`) in the preview build (fork `lib/story-imports.mjs` to stub it), then add `I18nProvider`/`AuthProvider` to `cfg.provider` (both would need adding to the bundle via the barrel). Not done here — deliberate scope call.

## Re-sync risks (watch-list)
- `.design-sync/.cache/` is gitignored: a re-sync MUST run `cfg.buildCmd` first to regenerate the barrel + compiled CSS, or `cfg.entry`/`cfg.cssEntry` won't exist.
- Tailwind content auto-detection (v4) roots at repo cwd; if utilities go missing after a components refactor, check compile-css.mjs `base`.
- HeroUI utilities are NOT compiled (globals.css has no `@config`), so `ui/button.tsx` and the slider (which use `@heroui/*`) may render partially unstyled.
