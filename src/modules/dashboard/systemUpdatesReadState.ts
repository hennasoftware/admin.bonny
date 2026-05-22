const READ_UPDATES_STORAGE_KEY = "bonny:read-system-patches";

export function loadReadUpdateIds() {
    if (typeof window === "undefined") return [];

    const storedValue = window.localStorage.getItem(READ_UPDATES_STORAGE_KEY);
    if (!storedValue) return [];

    try {
        const parsed = JSON.parse(storedValue);
        return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
        return [];
    }
}

export function persistReadUpdateIds(nextReadUpdates: string[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(READ_UPDATES_STORAGE_KEY, JSON.stringify(nextReadUpdates));
}

export function appendReadUpdateId(readUpdateIds: string[], updateId: string) {
    if (readUpdateIds.includes(updateId)) return readUpdateIds;
    return [...readUpdateIds, updateId];
}
