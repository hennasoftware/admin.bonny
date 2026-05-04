export function formatDateTime(date?: string | null | any) {
    if (!date) return "-";

    // Firestore Timestamp
    if (date && typeof date === "object" && typeof date.toDate === "function") {
        try {
            return new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
            }).format(date.toDate());
        } catch {
            return "-";
        }
    }

    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "-";

        return new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
        }).format(d);
    } catch {
        return "-";
    }
}
