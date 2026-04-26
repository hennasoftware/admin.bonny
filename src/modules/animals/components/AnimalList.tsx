import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui";
import type { AnimalRecord } from "../types";
import { AnimalStatusBadge } from "./AnimalStatusBadge";

interface AnimalListProps {
    animals: AnimalRecord[];
    loading?: boolean;
    onEdit: (animal: AnimalRecord) => void;
    onDelete: (animal: AnimalRecord) => void;
}

export function AnimalList({ animals, loading = false, onEdit, onDelete }: AnimalListProps) {
    return (
        <section className="rounded-[2rem] border border-orange-100 bg-white/92 p-6 shadow-sm dark:border-orange-500/10 dark:bg-slate-900/88 md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
                        Registros
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
                        Animais cadastrados
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Use busca e filtros para localizar, editar ou remover registros.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className="animate-pulse rounded-2xl border border-orange-100 bg-orange-50/30 p-4 dark:border-slate-800 dark:bg-slate-950/65"
                        >
                            <div className="h-5 w-36 rounded bg-orange-100 dark:bg-slate-800" />
                            <div className="mt-3 h-4 w-48 rounded bg-orange-100 dark:bg-slate-800" />
                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                <div className="h-4 rounded bg-orange-100 dark:bg-slate-800" />
                                <div className="h-4 rounded bg-orange-100 dark:bg-slate-800" />
                                <div className="h-4 rounded bg-orange-100 dark:bg-slate-800" />
                                <div className="h-4 rounded bg-orange-100 dark:bg-slate-800" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : animals.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 p-8 text-center dark:border-slate-700 dark:bg-slate-950/65">
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        Nenhum animal encontrado
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Ajuste a busca ou os filtros para ver outros registros.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {animals.map((animal) => (
                        <article
                            key={animal.id}
                            className="rounded-2xl border border-orange-100 bg-orange-50/40 p-4 dark:border-slate-800 dark:bg-slate-950/65"
                        >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="truncate text-lg font-semibold text-gray-950 dark:text-white">
                                            {animal.name}
                                        </h3>
                                        <AnimalStatusBadge status={animal.status} />
                                    </div>

                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {animal.species} • {animal.breed}
                                    </p>

                                    <div className="mt-3 grid gap-2 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-2">
                                        <p>Sexo: {animal.sex}</p>
                                        <p>Idade: {animal.age}</p>
                                        <p>Porte: {animal.size}</p>
                                        <p>Cor: {animal.color}</p>
                                    </div>

                                    {animal.notes && (
                                        <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm text-gray-600 dark:bg-slate-900 dark:text-gray-300">
                                            {animal.notes}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2 lg:min-w-48">
                                    <div className="rounded-xl bg-white px-4 py-3 text-xs text-gray-500 dark:bg-slate-900 dark:text-gray-400">
                                        {animal.updatedAt ? "Atualizado em" : "Cadastrado em"}{" "}
                                        <span className="font-medium text-gray-700 dark:text-gray-200">
                                            {animal.updatedAt ?? animal.createdAt}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button variant="secondary" onClick={() => onEdit(animal)} className="px-3 py-2">
                                            <Pencil className="h-4 w-4" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => onDelete(animal)}
                                            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:text-red-300 dark:hover:bg-red-500/10 px-3 py-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Excluir
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
