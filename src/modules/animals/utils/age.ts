export function sanitizeAnimalAgeInput(value: string) {
    return value.replace(/[^\d]/g, "");
}

export function parseAnimalAgeYears(value: string) {
    const match = value.trim().match(/\d+/);
    if (!match) return null;

    const years = Number.parseInt(match[0], 10);
    return Number.isFinite(years) && years > 0 ? years : null;
}

export function formatAnimalAge(years: number) {
    return `${years} ${years === 1 ? "ano" : "anos"}`;
}

export function formatAnimalAgeInput(value: string) {
    const years = parseAnimalAgeYears(value);
    return years === null ? "" : String(years);
}

export function formatAnimalAgeFromValue(value: string) {
    const years = parseAnimalAgeYears(value);
    return years === null ? "Idade não informada" : formatAnimalAge(years);
}
