import { CalendarClock, Cat, Dog, HeartPulse, ShieldCheck } from "lucide-react";
import type { AnimalRecord } from "../types/types";
import { AnimalStatusBadge } from "./AnimalStatusBadge";

interface AnimalCardsProps {
    animals: AnimalRecord[];
}

function speciesIcon(species: string) {
    return species.toLowerCase().includes("gato") ? Cat : Dog;
}

export function AnimalCards({ animals }: AnimalCardsProps) {
    return (
        <section className="rounded-4xl border border-orange-100 bg-white/92 p-6 shadow-sm dark:border-orange-500/10 dark:bg-slate-900/88 md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
                        Registros
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
                        Animais cadastrados
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Base inicial para consulta e acompanhamento.
                    </p>
                </div>

                <div className="rounded-2xl bg-orange-50 p-3 text-orange-500 dark:bg-orange-500/10 dark:text-orange-300">
                    <HeartPulse className="h-6 w-6" />
                </div>
            </div>

            <div className="space-y-4">
                {animals.map((animal) => {
                    const SpeciesIcon = speciesIcon(animal.species);

                    return (
                        <article
                            key={animal.id}
                            className="rounded-2xl border border-orange-100 bg-orange-50/40 p-4 dark:border-slate-800 dark:bg-slate-950/65"
                        >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="flex min-w-0 items-start gap-4">
                                    <div className="rounded-2xl bg-white p-3 text-orange-500 shadow-sm dark:bg-slate-900 dark:text-orange-300">
                                        <SpeciesIcon className="h-6 w-6" />
                                    </div>

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
                                    </div>
                                </div>

                                <div className="grid gap-2 text-xs text-gray-500 dark:text-gray-400 lg:min-w-40">
                                    <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 dark:bg-slate-900">
                                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                        {animal.neutered ? "Castrado" : "Não castrado"}
                                    </div>
                                    <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 dark:bg-slate-900">
                                        <ShieldCheck className="h-4 w-4 text-sky-500" />
                                        {animal.vaccinated ? "Vacinado" : "Pendente de vacina"}
                                    </div>
                                    <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 dark:bg-slate-900">
                                        <CalendarClock className="h-4 w-4 text-orange-500" />
                                        {animal.createdAt}
                                    </div>
                                </div>
                            </div>

                            {animal.notes && (
                                <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm text-gray-600 dark:bg-slate-900 dark:text-gray-300">
                                    {animal.notes}
                                </p>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
