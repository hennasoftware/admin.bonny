import { toDate, type AppDateValue } from "./date";

export type SortDirection = "desc" | "asc";

interface RecentSortable {
    createdAt: AppDateValue;
    updatedAt?: AppDateValue;
}

export function sortByRecent<T extends RecentSortable>(items: T[], direction: SortDirection) {
    return [...items].sort((left, right) => {
        const leftTime = toDate(left.updatedAt ?? left.createdAt)?.getTime() ?? 0;
        const rightTime = toDate(right.updatedAt ?? right.createdAt)?.getTime() ?? 0;
        return direction === "desc" ? rightTime - leftTime : leftTime - rightTime;
    });
}
