type TimestampLike = {
    seconds?: number;
    toDate?: () => Date;
};

export type AppDateValue = Date | string | number | TimestampLike | null | undefined;

export function toDate(value: AppDateValue): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;

    if (typeof value === "string" || typeof value === "number") {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    if (typeof value === "object") {
        if (typeof value.toDate === "function") {
            const parsed = value.toDate();
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }

        if (typeof value.seconds === "number") {
            const parsed = new Date(value.seconds * 1000);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }
    }

    return null;
}

export function formatDateTime(value: AppDateValue, fallback = "-") {
    const date = toDate(value);

    if (!date) return fallback;

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date);
}

export function getMonthKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(date: Date) {
    const month = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "");
    return month.charAt(0).toUpperCase() + month.slice(1);
}
