import { toDate, type AppDateValue } from "@/shared/utils/date";

export interface SystemUpdateEntry {
    id: string;
    version: string;
    title: string;
    summary: string;
    publishedAt: AppDateValue;
    kind: "feature" | "improvement" | "fix";
    highlights: string[];
    impactedAreas: string[];
    attentionNote?: string;
}

export function sortSystemUpdates(updates: SystemUpdateEntry[]) {
    return [...updates].sort((left, right) => {
        const leftDate = toDate(left.publishedAt)?.getTime() ?? 0;
        const rightDate = toDate(right.publishedAt)?.getTime() ?? 0;
        return rightDate - leftDate;
    });
}
