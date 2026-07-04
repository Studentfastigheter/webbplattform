# CampusLyan design system — how to build with it

CampusLyan is a Swedish student-housing platform. Its identity is a **deep forest green** (`--brand: #004225`) on warm neutrals, rounded/pill controls, and clean shadcn-style surfaces. Product copy is normally **Swedish** (e.g. "Ansök", "Sök bostad", "Hyra"). Components are React and are exposed on `window.CampusLyan.*` (compound subparts and ~200 icons are all there too).

## Setup — no provider needed
The components render standalone; there is **no ThemeProvider or context wrapper to add**. Just compose them. The brand tokens and component styling come entirely from the stylesheet — make sure `styles.css` is loaded (it `@import`s `_ds_bundle.css`, which carries every component's styles and the `:root` token layer). Do not wrap the app in a theme provider; the DS is light-theme only.

## Styling idiom — Tailwind utility classes + CSS-variable tokens
Style with **Tailwind v4 utility classes** driven by CSS-variable tokens. Never invent a color; use the token that carries the meaning. The verified vocabulary:

| Purpose | Utility class | CSS variable |
|---|---|---|
| Brand green (primary action, accents) | `bg-brand-500` `text-brand-500` `bg-brand-50` | `--brand` = #004225, `--color-brand-25`…`--color-brand-900` scale |
| Page / surface bg | `bg-background` `bg-card` `bg-popover` | `--background` `--card` `--popover` |
| Body / heading text | `text-foreground` `text-card-foreground` | `--foreground` |
| Muted / secondary text | `text-muted-foreground` | `--muted-foreground` |
| Muted / secondary surfaces | `bg-muted` `bg-secondary` `bg-accent` | `--muted` `--secondary` `--accent` |
| Neutral action fill (near-black in light theme) | `bg-primary` `text-primary-foreground` | `--primary` |
| Destructive | `bg-destructive` | `--destructive` |
| Borders / inputs | `border-border` `border-input` | `--border` `--input` |

Notes that matter:
- The **primary brand action is the green pill `Button` variant="default"** (`rounded-full bg-[#004225]`). `bg-primary` is a *neutral* near-black in the light theme — use `variant="default"` (or `bg-brand-500`) when you want brand green, not `bg-primary`.
- Controls are **pill-shaped** (`rounded-full`) for buttons; surfaces use `rounded-xl`/`rounded-lg`.
- For custom one-off styling the shipped stylesheet may not contain an arbitrary utility (it's compiled from the app's own class usage) — prefer the tokens above, or inline styles reading the CSS variables (`style={{ color: 'var(--brand)' }}`), and let real components carry their own look.

## Where the truth lives
- **Styling source**: `styles.css` → `_ds_bundle.css` (the `:root` token definitions + every component rule). Read it before inventing any class or color.
- **Per component**: `components/<group>/<Name>/<Name>.prompt.md` (usage + real import path, e.g. `import { Button } from "@/components/ui/button"`) and `<Name>.d.ts` (props). Read these before composing a component.

## Idiomatic example
```jsx
const { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction, Button } = window.CampusLyan;

<Card style={{ width: 360 }}>
  <CardHeader>
    <CardTitle>Ljus etta nära campus</CardTitle>
    <CardDescription className="text-muted-foreground">Lund · 1 rum och kök · 32 m²</CardDescription>
    <CardAction><span style={{ fontWeight: 700, color: 'var(--brand)' }}>6 500 kr/mån</span></CardAction>
  </CardHeader>
  <CardContent className="text-muted-foreground">Balkong, tvättmaskin, fem minuter från universitetet.</CardContent>
  <CardFooter style={{ gap: 8 }}>
    <Button variant="default" size="sm">Ansök</Button>
    <Button variant="ghost" size="sm">Spara</Button>
  </CardFooter>
</Card>
```
`Button` variants: `default` (green pill), `secondary`, `outline`, `ghost`, `destructive`, `link`, `text`; sizes `xs`/`sm`/`md`/`lg` + icon sizes.
