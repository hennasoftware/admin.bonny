import { Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { formatDateTime } from "@/modules/adopters/utils/formatter";
import type { AdoptionRecord } from "@/modules/adoptions/services/service";

interface AdoptionsListProps {
    adoptions: AdoptionRecord[];
    loading?: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onDelete: (item: AdoptionRecord) => void;
}

export function AdoptionsList({
    adoptions,
    loading = false,
    page,
    totalPages,
    onPageChange,
    onDelete,
}: AdoptionsListProps) {
    const canPrev = page > 1;
    const canNext = page < totalPages;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Página {page} de {totalPages}
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                        <tr>
                            <th className="px-4 py-3 text-left">Adotante</th>
                            <th className="px-4 py-3 text-left">Animal</th>
                            <th className="px-4 py-3 text-left">Observações</th>
                            <th className="px-4 py-3 text-left">Data</th>
                            <th className="px-4 py-3 text-right">Ações</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-6 text-center text-slate-500">
                                    Carregando adoções...
                                </td>
                            </tr>
                        ) : adoptions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-10 text-center">
                                    <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                                        Nenhuma adoção encontrada
                                    </p>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        Ajuste os filtros para refinar sua busca.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            adoptions.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{item.adopterName}</p>
                                            {item.adopterId ? (
                                                <p className="text-xs text-slate-500 dark:text-slate-400">ID: {item.adopterId}</p>
                                            ) : null}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{item.animalName}</p>
                                            {item.animalId ? (
                                                <p className="text-xs text-slate-500 dark:text-slate-400">ID: {item.animalId}</p>
                                            ) : null}
                                        </div>
                                    </td>

                                    <td className="max-w-xs px-4 py-3 text-slate-600 dark:text-slate-300">
                                        <div className="truncate">{item.notes || "-"}</div>
                                    </td>

                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                        {formatDateTime(item.createdAt)}
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

                {Array.from({ length: totalPages > 10 ? 10 : totalPages }).map((_, i) => {
                    const pageNum = page - 5 + i > 0 ? page - 5 + i : i + 1;
                    if (pageNum > totalPages) return null;

                    return (
                        <Button
                            key={pageNum}
                            variant={page === pageNum ? "primary" : "secondary"}
                            onClick={() => onPageChange(pageNum)}
                        >
                            {pageNum}
                        </Button>
                    );
                })}

                <Button variant="secondary" disabled={!canNext} onClick={() => onPageChange(page + 1)}>
                    Próxima
                </Button>
            </div>
        </section>
    );
}
