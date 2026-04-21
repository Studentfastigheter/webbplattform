
export function getActiveLanguage(): string {
    return localStorage.getItem("CampusLyan_language") || "se";
}

export function altText(txt: Record<string, string>): string {
    return txt[getActiveLanguage()] || txt.se;
}

