import {Pencil, Trash2} from "lucide-react";
import {Button} from "@/shared/components/ui";
import {AnimalStatusBadge} from "./AnimalStatusBadge";
import {formatDateTime} from "@/modules/animals/utils/formatter";
import type {AnimalRecord} from "../types";

interface AnimalListProps {
    animals: AnimalRecord[];
    loading?: boolean;
    onEdit: (animal: AnimalRecord) => void;
    onDelete: (animal: AnimalRecord) => void;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function AnimalList({
    animals,
    loading = false,
    onEdit,
    onDelete,
    page,
    totalPages,
    onPageChange,
}: AnimalListProps) {
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
                    <thead
                        className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                        <tr>
                            <th className="px-4 py-3 text-left">Nome</th>
                            <th className="px-4 py-3 text-left">Espécie</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Detalhes</th>
                            <th className="px-4 py-3 text-left">Atualização</th>
                            <th className="px-4 py-3 text-right">Ações</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="p-6 text-center text-slate-500">
                                    Carregando animais...
                                </td>
                            </tr>
                        ) : animals.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-10 text-center">
                                    <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                                        Nenhum animal encontrado
                                    </p>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        Ajuste os filtros para refinar sua busca.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            animals.map((animal: AnimalRecord) => (
                                <tr
                                    key={animal.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-900/60"
                                >
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white max-w-25 truncate whitespace-nowrap">
                                        {animal.name}
                                    </td>

                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        {animal.species} • {animal.breed}
                                    </td>

                                    <td className="px-4 py-3">
                                        <AnimalStatusBadge status={animal.status}/>
                                    </td>

                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        {animal.sex} • {animal.age}
                                    </td>

                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                        {formatDateTime(
                                            animal.updatedAt ?? animal.createdAt
                                        )}
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="secondary"
                                                onClick={() => onEdit(animal)}
                                            >
                                                <Pencil className="h-4 w-4"/>
                                            </Button>

                                            <Button
                                                variant="secondary"
                                                onClick={() => onDelete(animal)}
                                                className="text-red-600 hover:bg-red-50 dark:text-red-300"
                                            >
                                                <Trash2 className="h-4 w-4"/>
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
                <Button
                    variant="secondary"
                    disabled={!canPrev}
                    onClick={() => onPageChange(page - 1)}
                >
                    Anterior
                </Button>

                {Array.from({length: totalPages > 10 ? 10 : totalPages}).map((_, i) => {
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

                <Button
                    variant="secondary"
                    disabled={!canNext}
                    onClick={() => onPageChange(page + 1)}
                >
                    Próxima
                </Button>
            </div>
        </section>
    );
}