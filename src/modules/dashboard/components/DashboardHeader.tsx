interface DashboardHeaderProps {
    userEmail?: string | null;
}

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
    return (
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
                    Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Visão geral da operação
                </p>
            </div>

            <div className="rounded-xl border border-orange-100 bg-white/85 px-4 py-3 text-sm shadow-sm dark:border-orange-500/10 dark:bg-slate-900/80">
                <p className="text-gray-500 dark:text-gray-400">Sessão ativa</p>
                <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                    {userEmail ?? "Usuário autenticado"}
                </p>
            </div>
        </div>
    );
}
