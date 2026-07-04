import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // Standardignores från eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Projektspecifikt: genererat/externt som inte ska lintas.
    ".design-sync/**",
    ".ds-sync/**",
    ".agents/**",
    "ds-bundle/**",
    "data/**",
    "public/**",
    "tooling/**",
    // Död Tailwind v3-konfig (laddas aldrig under v4) — tas bort i Etapp 3
    // tillsammans med HeroUI.
    "tailwind.config.js",
  ]),
  {
    rules: {
      // Apostrofer/citattecken i svensk brödtext är avsiktliga — regeln ger
      // bara brus i ett innehållstungt UI.
      "react/no-unescaped-entities": "off",

      // NEDTRAPPNINGSPLAN: reglerna nedan är riktiga kvalitetsproblem men
      // träffar ~90 befintliga ställen, varav de flesta ligger i kod som
      // skrivs om under Etapp 3–6 (UI-konsolidering, designlyft, admin-split).
      // De är nedgraderade till varningar så att lint kan gate:a CI redan nu.
      // Varje etapp betar av varningarna i filer den rör; när en regel når
      // noll varningar promoveras den tillbaka till "error" här.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/use-memo": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react/display-name": "warn",
    },
  },
]);

export default eslintConfig;
