import { TrendingUp } from "lucide-react";
import type { DashboardStat } from "../types";

type StatsCardProps = DashboardStat;

export function StatsCard({ title, value, growth, icon: Icon }: StatsCardProps) {
    return (
        <article className="group relative min-w-0 overflow-hidden rounded-[24px] border border-orange-100/70 bg-white/88 p-4 shadow-[0_14px_32px_-26px_rgb(15_23_42/0.24)] transition-colors duration-200 hover:border-orange-200 dark:border-slate-700/60 dark:bg-slate-950/72 sm:p-5">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-400 via-amber-300 to-orange-200 opacity-80" />

            <div className="relative mb-4 flex items-start justify-between gap-3 sm:mb-5 sm:gap-4">
                <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-2.5 text-orange-500 shadow-sm dark:border-orange-500/10 dark:from-orange-500/10 dark:to-slate-900 dark:text-orange-300 sm:p-3">
                    <Icon className="h-5 w-5" />
                </div>

                <div className="inline-flex max-w-[55%] items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:border-emerald-500/15 dark:bg-emerald-500/10 dark:text-emerald-300 sm:max-w-none sm:px-2.5 sm:text-[11px]">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {growth}
                </div>
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">{title}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-950 sm:mt-3 sm:text-4xl dark:text-white">
                {value}
            </p>
        </article>
    );
}
