import { PlusCircle } from "lucide-react";
import type { AdoptionRecord } from "@/modules/adoptions/services/service";
import type { AdopterRecord } from "@/modules/adopters/types";
import type { AnimalRecord } from "@/modules/animals/types/types";
import { DashboardGlobalSearch } from "./DashboardGlobalSearch";

interface DashboardHeaderProps {
    userEmail?: string | null;
    animals: AnimalRecord[];
    adopters: AdopterRecord[];
    adoptions: AdoptionRecord[];
}

export function DashboardHeader({ userEmail, animals, adopters, adoptions }: DashboardHeaderProps) {
    const todayLabel = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(new Date());

    return (
        <div className="relative mb-8 overflow-hidden rounded-[28px] border border-orange-100/70 bg-white/75 p-5 shadow-[0_20px_80px_-40px_rgb(249_115_22/0.45)] backdrop-blur-xl sm:mb-10 sm:p-6 dark:border-slate-700/50 dark:bg-slate-950/55 md:p-7">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.12),transparent_28%)]" />

            <div className="relative flex flex-col gap-6">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-orange-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 dark:border-orange-400/20 dark:bg-orange-500/10 dark:text-orange-200">
                            Painel operacional
                        </div>

                        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-gray-950 sm:text-4xl dark:text-white">
                            Dashboard
                        </h1>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-[15px]">
                            Visao consolidada da operacao, com indicadores de ritmo, conversao e movimentacao recente.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[29rem]">
                        <div className="rounded-2xl border border-orange-100/70 bg-white/85 px-4 py-3 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/80">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">Sessao ativa</p>
                            <p className="mt-2 truncate text-sm font-medium text-gray-950 dark:text-white">
                                {userEmail ?? "Usuario autenticado"}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-orange-100/70 bg-white/85 px-4 py-3 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/80">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">Atualizado em</p>
                            <p className="mt-2 capitalize text-sm font-medium text-gray-950 dark:text-white">{todayLabel}</p>
                        </div>
                    </div>
                </div>

                <DashboardGlobalSearch animals={animals} adopters={adopters} adoptions={adoptions} />

                <div className="grid gap-3 sm:grid-cols-2">
                    <a
                        href="/animais/cadastro"
                        className="inline-flex items-center justify-between rounded-2xl border border-orange-200/80 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-100 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200 dark:hover:bg-orange-500/15"
                    >
                        <span>Novo animal</span>
                        <PlusCircle className="h-4 w-4" />
                    </a>

                    <a
                        href="/adocoes/cadastro"
                        className="inline-flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <span>Nova adocao</span>
                        <PlusCircle className="h-4 w-4 text-orange-500" />
                    </a>
                </div>
            </div>
        </div>
    );
}
