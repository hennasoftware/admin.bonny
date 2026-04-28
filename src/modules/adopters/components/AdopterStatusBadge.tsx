import type { AdopterStatus } from "../types";

interface AdopterStatusBadgeProps {
    status: AdopterStatus;
}

const STATUS_CONFIG: Record<AdopterStatus, { bg: string; text: string; border: string }> = {
    Ativo: {
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-300",
        border: "border-emerald-200 dark:border-emerald-500/20",
    },
    Inativo: {
        bg: "bg-gray-50 dark:bg-gray-500/10",
        text: "text-gray-600 dark:text-gray-300",
        border: "border-gray-200 dark:border-gray-500/20",
    },
    Bloqueado: {
        bg: "bg-red-50 dark:bg-red-500/10",
        text: "text-red-600 dark:text-red-300",
        border: "border-red-200 dark:border-red-500/20",
    },
} as const;

export function AdopterStatusBadge({ status }: AdopterStatusBadgeProps) {
    const config = STATUS_CONFIG[status];

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
        >
            {status}
        </span>
    );
}
