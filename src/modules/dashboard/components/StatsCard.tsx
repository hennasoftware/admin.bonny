import { TrendingUp } from "lucide-react";
import type { DashboardStat } from "../types";

type StatsCardProps = DashboardStat;

export function StatsCard({ title, value, growth, icon: Icon }: StatsCardProps) {
    return (
        <article className="min-w-0 rounded-2xl border border-orange-100 bg-white/90 p-5 shadow-sm dark:border-orange-500/10 dark:bg-slate-900/85">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div className="rounded-xl bg-orange-50 p-3 text-orange-500 dark:bg-orange-500/10 dark:text-orange-300">
                    <Icon className="h-5 w-5" />
                </div>

                <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {growth}
                </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 dark:text-white">
                {value}
            </p>
        </article>
    );
}
