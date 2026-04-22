"use client";

/**
 * Language context.
 *
 * Provide per-language options:
 *
 *      return (
 *          <p>
 *          {staticTranslate({
 *              [SWEDISH]: "Hej!",
 *              [ENGLISH]: "Hello!"
 *          })} 
 *          </p>);
 *
 * Dynamically translate content:
 *
 *      const [text, setText] = useState<string>("");
 *      useEffect(() => {
 *          (async () => {
 *              setText(await service.getText());
 *          })();
 *      }, []);
 *      return (
 *          <p>
 *          {dynamicTranslate(text)}
 *          </p>
 *      );
 *
 * Get/set the active locale:
 *      const { lang, setLang } = useLang();
 *      setLang(ENGLISH);
 */

import React, { createContext, useContext, useState } from "react";
import { useTranslation, UseTranslationResponse } from "react-i18next";


export type Lang = "se-SE" | "en-US";

export const SWEDISH: Lang = "se-SE";
export const ENGLISH: Lang = "en-US";

export type LangCtx = {
    lang: Lang,
    setLang: (to: Lang) => void,
};

const Ctx = createContext<LangCtx | undefined>(undefined);

export function LangProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<Lang>(SWEDISH);
    return (
        <Ctx.Provider value={{
            lang, 
            setLang
        }}>
            {children}
        </Ctx.Provider>
    );
}

/**
 * Get access to the language context.
 *
 * Enables the caller to set, or detect the used language.
 *
 * The language follows the international locale format, meaning
 * the Swedish language will be "se-SE" and English "en-US". For 
 * the sake of consistency, it is recommended that the SWEDISH, 
 * and ENGLISH constants (defined in this module) are used instead 
 * of the raw strings.
 */
export function useLang() {
    const ctx = useContext(Ctx);
    if (!ctx) {
        throw new Error("useLang must be used within LangProvider");
    }
    return ctx;
}

/**
 * Statically translate a text snippet.
 *
 * This function requires that the caller supplies each translation manually
 * using a record. The keys in this record should be of the locale string format,
 * I.e "se-SE" for Swedish and "en-US" for English.
 *
 */
export function staticTranslate(translations: Record<Lang, string>, lang: Lang): string {
    if (!translations[SWEDISH]) {
        throw new Error("The SWEDISH ('se-SE') language has to be provided.");
    }
    return translations[lang] || translations[SWEDISH];
}


