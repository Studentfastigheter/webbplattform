// Generate the design-sync bundle entry barrel from src/components.
//
// This repo is a Next.js app, not a published package, so there is no dist
// entry to bundle. This barrel re-exports every component (and the icon set)
// onto one module so the converter can assign them to window.<GLOBAL>. Two
// things a naive `export *` gets wrong, handled here:
//   1. `export *` does NOT forward a module's `export default` — many
//      components here are default exports (Tag, StatusTag, EntityHero, …),
//      so each default is re-exported explicitly as `{ default as <Name> }`.
//   2. A PascalCase name exported by >1 file (e.g. Button in ui/ and base/)
//      is ambiguous under multiple `export *`; an explicit winner is appended
//      (direct named exports take precedence over `export *`), ui/ preferred.
//
// Regenerated on every build (cfg.buildCmd) so it stays in sync with src/.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, dirname, basename } from 'node:path';

const SRC = 'src/components';
const OUT = '.design-sync/.cache/ds-entry.tsx';

// Files kept off the global: pure metadata, and DOM/leaflet-only modules that
// can't be bundled into a static IIFE. Adjust as build errors reveal more.
const EXCLUDE = new Set([
  'src/components/icons/catalog.tsx',
  'src/components/shared/map/BaseMap.tsx',
  'src/components/shared/map/BaseMapClient.tsx',
  'src/components/shared/map/ListingsMap.tsx',
  'src/components/shared/map/ListingsMapPopup.tsx',
  'src/components/ui/sliders/Controlled_Range.tsx',
]);

const files = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name).replace(/\\/g, '/');
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx|ts)$/.test(e.name) && !/\.(test|spec|stories)\./.test(e.name) && !/\.d\.ts$/.test(e.name) && !EXCLUDE.has(p)) files.push(p);
  }
})(SRC);
files.sort();

const isPascal = (n) => /^[A-Z][A-Za-z0-9]*$/.test(n);
// Map a source file to its `@/…` import specifier (drop extension + /index).
function spec(f) {
  let s = f.replace(/^src\//, '@/').replace(/\.(tsx|ts)$/, '');
  s = s.replace(/\/index$/, '');
  return s;
}

const nameOwners = new Map(); // PascalCase named export -> [files]
const perFile = [];           // { file, spec, named:Set, def:string|null }

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const named = new Set();
  for (const m of src.matchAll(/export\s+(?:const|let|var|function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g)) {
    if (!/\bdefault\b/.test(m[0])) named.add(m[1]);
  }
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(',')) {
      const seg = part.trim();
      if (!seg || /\bas\s+default\b/.test(seg)) continue;
      const asM = seg.match(/\bas\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
      const nm = asM ? asM[1] : seg.split(/\s+/)[0];
      if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(nm) && nm !== 'default') named.add(nm);
    }
  }
  // default export name (for `export { default as Name }`)
  let def = null;
  const dfn = src.match(/export\s+default\s+(?:async\s+)?(?:function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
  const dId = src.match(/export\s+default\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*;/);
  const dAs = src.match(/export\s*\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s+as\s+default\s*\}/);
  const hasDefault = /export\s+default\b/.test(src) || !!dAs;
  if (hasDefault) {
    def = (dfn && dfn[1]) || (dId && dId[1]) || (dAs && dAs[1]) || null;
    // anonymous default → PascalCase of file basename
    if (!def) {
      const base = basename(f).replace(/\.(tsx|ts)$/, '').replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
      def = base[0].toUpperCase() + base.slice(1);
    }
  }
  // A default whose name is already a named export of the same file is the
  // same component — drop the alias so we don't emit a duplicate export.
  if (def && named.has(def)) def = null;
  const owned = new Set(named);
  if (def) owned.add(def);
  for (const n of owned) if (isPascal(n)) {
    const set = nameOwners.get(n) ?? new Set();
    set.add(f);
    nameOwners.set(n, set);
  }
  perFile.push({ file: f, spec: spec(f), named, def });
}

// winner ranking for collisions
const rank = (f) => (f.includes('/ui/') ? 0 : f.includes('/foundations/') ? 1 : f.includes('/base/') ? 2 : f.includes('/shared/') ? 3 : f.includes('/layout/') ? 4 : 5);
const collisions = [...nameOwners.entries()].filter(([, fs]) => fs.size > 1);

// A `process` global must exist before any bundled module initializes — React
// and other deps read process.env at module top-level, and the converter only
// defines process.env.NODE_ENV (not bare `process`), so an un-shimmed `process`
// throws at IIFE init and aborts the whole bundle before window.<GLOBAL> is set.
// ESM evaluates dependencies in source order, so importing this leaf FIRST makes
// it run before every re-export below.
// Placeholder public env values so modules that validate env at import time
// (e.g. src/lib/api/client.ts throws when NEXT_PUBLIC_API_URL is unset) don't
// abort the IIFE. These are non-secret placeholders — static preview renders
// make no network calls, the values only need to be non-empty. NOT real config.
writeFileSync(join(dirname(OUT), 'process-shim.mjs'),
  'var g = globalThis;\n' +
  'if (typeof g.process === "undefined" || g.process === null) g.process = {};\n' +
  'if (!g.process.env) g.process.env = {};\n' +
  'var __ph = {\n' +
  '  NEXT_PUBLIC_API_URL: "https://api.campuslyan.example",\n' +
  '  NEXT_PUBLIC_SITE_URL: "https://campuslyan.se",\n' +
  '  NEXT_PUBLIC_PLATFORM_LAUNCHED: "true",\n' +
  '  NEXT_PUBLIC_FIREBASE_API_KEY: "preview",\n' +
  '  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "preview",\n' +
  '  NEXT_PUBLIC_FIREBASE_APP_ID: "preview",\n' +
  '  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "preview.firebaseapp.com",\n' +
  '  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "preview",\n' +
  '  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "preview.appspot.com",\n' +
  '  NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID: "preview",\n' +
  '  NEXT_PUBLIC_FREJA_LAUNCH_BASE_URL: "https://example.com",\n' +
  '};\n' +
  'for (var k in __ph) if (!g.process.env[k]) g.process.env[k] = __ph[k];\n');

const lines = [
  '// AUTO-GENERATED by .design-sync/gen-entry.mjs — do not edit.',
  '// Re-exports every CampusLyan component + icon onto one module for window.<GLOBAL>.',
  '/* eslint-disable */',
  'import "./process-shim.mjs";',
  '',
];
for (const pf of perFile) {
  lines.push(`export * from ${JSON.stringify(pf.spec)};`);
  if (pf.def) lines.push(`export { default as ${pf.def} } from ${JSON.stringify(pf.spec)};`);
}
if (collisions.length) {
  lines.push('', '// collision winners (explicit named export beats ambiguous export *)');
  for (const [name, fs] of collisions) {
    const winner = [...fs].sort((a, b) => rank(a) - rank(b))[0];
    const wf = perFile.find((p) => p.file === winner);
    // If the winner provides this name as a default, alias the default; else re-export named.
    if (wf.def === name && !wf.named.has(name)) lines.push(`export { default as ${name} } from ${JSON.stringify(wf.spec)};`);
    else lines.push(`export { ${name} } from ${JSON.stringify(wf.spec)};`);
  }
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, lines.join('\n') + '\n');
console.error(`gen-entry: ${perFile.length} files, ${nameOwners.size} names, ${collisions.length} collisions -> ${OUT}`);
if (collisions.length) console.error('  collisions: ' + collisions.map(([n]) => n).join(', '));
