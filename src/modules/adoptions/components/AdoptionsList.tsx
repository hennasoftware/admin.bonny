import { Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { formatDateTime } from "@/shared/utils/date";
import type { AdoptionRecord, AdoptionStatus } from "@/modules/adoptions/services/service";

interface AdoptionsListProps {
    adoptions: AdoptionRecord[];
    loading?: boolean;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    onPageChange: (page: number) => void;
    onDelete: (item: AdoptionRecord) => void;
    onStatusChange: (item: AdoptionRecord, status: AdoptionStatus) => void;
}

const statusStyles: Record<AdoptionStatus, string> = {
    "Em analise": "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    Agendada: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
    Concluida: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
};

export function AdoptionsList({
    adoptions,
    loading = false,
    page,
    totalPages,
    hasNextPage,
    onPageChange,
    onDelete,
    onStatusChange,
}: AdoptionsListProps) {
    const canPrev = page > 1;
    const canNext = hasNextPage;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Pagina {page} de {totalPages}
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                        <tr>
                            <th className="px-4 py-3 text-left">Adotante</th>
                            <th className="px-4 py-3 text-left">Animal</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Observacoes</th>
                            <th className="px-4 py-3 text-left">Atualizacao</th>
                            <th className="px-4 py-3 text-right">Acoes</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="p-6 text-center text-slate-500">
                                    Carregando adocoes...
                                </td>
                            </tr>
                        ) : adoptions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-10 text-center">
                                    <p className="text-base font-medium text-slate-900 dark:text-slate-100">Nenhuma adocao encontrada</p>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Ajuste os filtros ou registre uma nova adocao.</p>
                                </td>
                            </tr>
                        ) : (
                            adoptions.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{item.adopterName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">ID: {item.adopterId}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{item.animalName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">ID: {item.animalId}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-2">
                                            <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[item.status]}`}>
                                                {item.status}
                                            </span>
                                            <select
                                                value={item.status}
                                                onChange={(event) => onStatusChange(item, event.target.value as AdoptionStatus)}
                                                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none transition-shadow focus:border-orange-500 focus:ring-2 focus:ring-orange-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                            >
                                                <option value="Em analise">Em analise</option>
                                                <option value="Agendada">Agendada</option>
                                                <option value="Concluida">Concluida</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td className="max-w-xs px-4 py-3 text-slate-600 dark:text-slate-300">
                                        <div className="truncate">{item.notes || "-"}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                        {formatDateTime(item.updatedAt ?? item.createdAt)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="secondary"
                                                onClick={() => onDelete(item)}
                                                className="text-red-600 hover:bg-red-50 dark:text-red-300"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-center gap-2 border-t border-slate-200 p-4 dark:border-slate-800">
                <Button variant="secondary" disabled={!canPrev} onClick={() => onPageChange(page - 1)}>
                    Anterior
                </Button>
                <Button variant="secondary" disabled={!canNext} onClick={() => onPageChange(page + 1)}>
                    Proxima
                </Button>
            </div>
        </section>
    );
}
