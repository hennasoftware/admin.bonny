import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { AnimalStatusBadge } from "./AnimalStatusBadge";
import { formatDateTime } from "@/modules/animals/utils/formatter";
import type { AnimalRecord } from "../types";

interface AnimalListProps {
    animals: AnimalRecord[];
    loading?: boolean;
    onEdit: (animal: AnimalRecord) => void;
    onDelete: (animal: AnimalRecord) => void;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    onPageChange: (page: number) => void;
}

export function AnimalList({
    animals,
    loading = false,
    onEdit,
    onDelete,
    page,
    totalPages,
    hasNextPage,
    onPageChange,
}: AnimalListProps) {
    const canPrev = page > 1;
    const canNext = hasNextPage;

    return (
        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/82 shadow-[0_18px_50px_-34px_rgb(15_23_42/0.28)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-950/60">
            <div className="border-b border-slate-200/70 px-5 py-4 dark:border-slate-800 sm:px-6">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Pagina {page} de {totalPages}
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-slate-200/70 bg-slate-50/80 text-xs uppercase tracking-[0.12em] text-slate-500 dark:border-slate-800 dark:bg-slate-900/80">
                        <tr>
                            <th className="px-4 py-3 text-left">Nome</th>
                            <th className="px-4 py-3 text-left">Especie</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Detalhes</th>
                            <th className="px-4 py-3 text-left">Atualizacao</th>
                            <th className="px-4 py-3 text-right">Acoes</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                    Carregando animais...
                                </td>
                            </tr>
                        ) : animals.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-10 text-center">
                                    <p className="text-base font-medium text-slate-900 dark:text-slate-100">Nenhum animal encontrado</p>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Ajuste os filtros ou cadastre um novo animal.</p>
                                </td>
                            </tr>
                        ) : (
                            animals.map((animal) => (
                                <tr key={animal.id} className="transition-colors hover:bg-orange-50/50 dark:hover:bg-slate-900/60">
                                    <td className="max-w-25 truncate whitespace-nowrap px-4 py-4 font-medium text-slate-900 dark:text-white">
                                        {animal.name}
                                    </td>
                                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                                        {animal.species} • {animal.breed}
                                    </td>
                                    <td className="px-4 py-4">
                                        <AnimalStatusBadge status={animal.status} />
                                    </td>
                                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                                        {animal.sex} • {animal.age}
                                    </td>
                                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                                        {formatDateTime(animal.updatedAt ?? animal.createdAt)}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="secondary" onClick={() => onEdit(animal)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => onDelete(animal)}
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

            <div className="flex items-center justify-center gap-2 border-t border-slate-200/70 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/40">
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
