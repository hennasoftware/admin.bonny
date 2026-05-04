import type { RecentOrder } from "../types";

interface RecentOrdersProps {
    loading: boolean;
    orders: RecentOrder[];
}

const statusStyles: Record<RecentOrder["status"], string> = {
    Concluida: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    "Em analise": "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    Agendada: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
};

export function RecentOrders({ loading, orders }: RecentOrdersProps) {
    return (
        <aside className="rounded-2xl border border-orange-100 bg-white/90 p-6 shadow-sm dark:border-orange-500/10 dark:bg-slate-900/85">
            <header className="mb-6">
                <h2 className="text-base font-semibold text-gray-950 dark:text-white">Adocoes recentes</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ultimas movimentacoes da operacao</p>
            </header>

            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="animate-pulse rounded-xl border border-orange-100 p-4 dark:border-slate-800">
                            <div className="h-4 w-24 rounded bg-orange-100 dark:bg-slate-800" />
                            <div className="mt-3 h-5 w-36 rounded bg-orange-100 dark:bg-slate-800" />
                            <div className="mt-3 h-4 w-20 rounded bg-orange-100 dark:bg-slate-800" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <article key={order.id} className="rounded-xl border border-orange-100 p-4 dark:border-slate-800">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-400">{order.id}</p>
                                    <p className="mt-2 truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {order.petName} • {order.adopterName}
                                    </p>
                                </div>

                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[order.status]}`}>
                                    {order.status}
                                </span>
                            </div>

                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{order.date}</p>
                        </article>
                    ))}
                </div>
            )}
        </aside>
    );
}
