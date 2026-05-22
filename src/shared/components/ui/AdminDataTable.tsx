import type { ReactNode } from "react";

interface AdminDataTableProps {
    title: string;
    loading?: boolean;
    loadingMessage?: string;
    emptyTitle: string;
    emptyDescription: string;
    isEmpty: boolean;
    minWidthClassName?: string;
    columnCount: number;
    head: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
}

export function AdminDataTable({
    title,
    loading = false,
    loadingMessage = "Carregando dados...",
    emptyTitle,
    emptyDescription,
    isEmpty,
    minWidthClassName = "",
    columnCount,
    head,
    children,
    footer,
}: AdminDataTableProps) {
    return (
        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/88 shadow-[0_18px_50px_-34px_rgb(15_23_42/0.28)] dark:border-slate-700/60 dark:bg-slate-950/72">
            <div className="border-b border-slate-200/70 px-5 py-4 dark:border-slate-800 sm:px-6">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            </div>

            <div className="overflow-x-auto">
                <table className={`${minWidthClassName} w-full text-sm`.trim()}>
                    <thead className="border-b border-slate-200/70 bg-slate-50/80 text-xs uppercase tracking-[0.12em] text-slate-500 dark:border-slate-800 dark:bg-slate-900/80">
                        {head}
                    </thead>

                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
                        {loading ? (
                            <tr>
                                <td colSpan={columnCount} className="p-8 text-center text-slate-500">
                                    {loadingMessage}
                                </td>
                            </tr>
                        ) : isEmpty ? (
                            <tr>
                                <td colSpan={columnCount} className="p-10 text-center">
                                    <p className="text-base font-medium text-slate-900 dark:text-slate-100">{emptyTitle}</p>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{emptyDescription}</p>
                                </td>
                            </tr>
                        ) : (
                            children
                        )}
                    </tbody>
                </table>
            </div>

            {footer ? (
                <div className="flex items-center justify-center gap-2 border-t border-slate-200/70 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                    {footer}
                </div>
            ) : null}
        </section>
    );
}
