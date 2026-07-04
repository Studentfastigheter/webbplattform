// Compile the app's Tailwind v4 entry (src/app/globals.css) into a static
// stylesheet the design-sync converter can ship via cfg.cssEntry. Components
// use utility classes but never import CSS, so this compiled file carries BOTH
// the brand token layer (:root vars) AND every utility the components use.
// Content is auto-detected by Tailwind v4 from `base` (repo root) — respecting
// .gitignore, so node_modules is skipped except explicit @source globs.
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const INPUT = 'src/app/globals.css';
const OUT = '.design-sync/.cache/compiled.css';

const css = readFileSync(INPUT, 'utf8');
const result = await postcss([
  tailwind({ base: process.cwd(), optimize: true }),
]).process(css, { from: INPUT, to: OUT });

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, result.css);
console.error(`compiled ${INPUT} -> ${OUT} (${(result.css.length / 1024).toFixed(0)} KB)`);
