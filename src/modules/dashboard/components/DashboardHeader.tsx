interface DashboardHeaderProps {
    userEmail?: string | null;
}

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
    const todayLabel = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(new Date());

    return (
        <div className="relative mb-8 overflow-hidden rounded-[28px] border border-orange-100/70 bg-white/75 p-5 shadow-[0_20px_80px_-40px_rgb(249_115_22/0.45)] backdrop-blur-xl sm:mb-10 sm:p-6 dark:border-slate-700/50 dark:bg-slate-950/55 md:p-7">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.12),transparent_28%)]" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-orange-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 dark:border-orange-400/20 dark:bg-orange-500/10 dark:text-orange-200">
                        Painel operacional
                    </div>

                    <h1 className="mt-4 text-2xl font-semibold tracking-tight text-gray-950 sm:text-4xl dark:text-white">
                        Dashboard
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-[15px]">
                        Visão consolidada da operação, com indicadores de ritmo, conversão e movimentação recente.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[26rem]">
                    <div className="rounded-2xl border border-orange-100/70 bg-white/85 px-4 py-3 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/80">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">Sessão ativa</p>
                        <p className="mt-2 truncate text-sm font-medium text-gray-950 dark:text-white">
                            {userEmail ?? "Usuário autenticado"}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-orange-100/70 bg-white/85 px-4 py-3 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/80">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">Atualizado em</p>
                        <p className="mt-2 capitalize text-sm font-medium text-gray-950 dark:text-white">{todayLabel}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
