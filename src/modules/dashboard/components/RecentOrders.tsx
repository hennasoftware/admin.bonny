import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { RecentOrder } from "../types";

interface RecentOrdersProps {
    loading: boolean;
    orders: RecentOrder[];
}

const statusStyles: Record<RecentOrder["status"], string> = {
    Concluida: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    "Em analise": "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    Agendada: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300",
};

export function RecentOrders({ loading, orders }: RecentOrdersProps) {
    return (
        <aside className="self-start overflow-hidden rounded-3xl border border-orange-100/70 bg-white/80 p-5 shadow-[0_18px_50px_-30px_rgb(15_23_42/0.35)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-950/60 sm:p-6">
            <header className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/70 pb-4 dark:border-slate-800">
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Fluxo recente</p>
                    <h2 className="mt-2 text-lg font-semibold tracking-tight text-gray-950 dark:text-white">Adocoes recentes</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ultimas movimentacoes relevantes da operacao</p>
                </div>

                <div className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
                    {orders.length} itens
                </div>
            </header>

            {loading ? (
                <div className="grid gap-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="animate-pulse rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50"
                        >
                            <div className="h-3 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
                            <div className="mt-4 h-4 w-40 rounded-full bg-slate-200 dark:bg-slate-800" />
                            <div className="mt-4 h-3 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="grid min-h-36 place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8 text-center text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-gray-400">
                    Nenhuma adocao recente encontrada.
                </div>
            ) : (
                <div className="grid gap-3">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            to={`/adocoes/lista?search=${encodeURIComponent(order.id)}`}
                            aria-label={`Abrir adoção ${order.petName} de ${order.adopterName}`}
                            className="group block overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50 transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_18px_40px_-28px_rgb(249_115_22/0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 dark:border-slate-800 dark:from-slate-950/80 dark:to-slate-900/60"
                        >
                            <article className="grid min-w-0 gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                                <div className="min-w-0 space-y-3">
                                    <div className="min-w-0">
                                        <p className="min-w-0 break-words text-sm font-semibold leading-5 text-gray-950 dark:text-white">
                                            {order.petName} <span className="text-gray-300 dark:text-gray-600">•</span> {order.adopterName}
                                        </p>
                                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
                                            {order.date}
                                        </p>
                                    </div>

                                    {order.notesPreview ? (
                                        <p className="max-h-12 overflow-hidden text-sm leading-6 text-gray-600 dark:text-gray-300">
                                            {order.notesPreview}
                                        </p>
                                    ) : (
                                        <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                                            Clique para abrir os detalhes desta adoção na lista completa.
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-2">
                                        <span
                                            title={order.id}
                                            className="inline-flex max-w-full min-w-0 items-center overflow-hidden rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:max-w-[16rem]"
                                        >
                                            <span className="min-w-0 truncate">ID {order.id}</span>
                                        </span>
                                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                            {order.petName}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start gap-3 sm:items-end">
                                    <span className={`inline-flex max-w-full shrink-0 items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyles[order.status]}`}>
                                        {order.status}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-600 transition group-hover:translate-x-0.5 dark:text-orange-300">
                                        Ver na lista
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </span>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            )}
        </aside>
    );
}
