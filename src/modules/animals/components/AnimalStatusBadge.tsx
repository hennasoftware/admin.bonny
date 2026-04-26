import type { AnimalStatus } from "../types";

const statusStyles: Record<AnimalStatus, string> = {
    Disponível: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    "Em processo": "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    Adotado: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
};

interface AnimalStatusBadgeProps {
    status: AnimalStatus;
}

export function AnimalStatusBadge({ status }: AnimalStatusBadgeProps) {
    return (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}>
            {status}
        </span>
    );
}
