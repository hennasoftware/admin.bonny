import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/modules/dashboard/AdminLayout";
import { AnimalCards, AnimalRegistrationForm } from "../components";
import type { AnimalRecord } from "../types/types";

export function AnimalsPage() {
    const [animals, setAnimals] = useState<AnimalRecord[]>([]);

    return (
        <>
            <Helmet>
                <title>Bonny | Animais</title>
            </Helmet>

            <AdminLayout>
                <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-100 px-4 py-20 md:px-8 md:py-10 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
                    <div className="mx-auto grid w-full max-w-7xl gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                        <section className="rounded-[2rem] border border-orange-100 bg-white/92 p-6 shadow-sm dark:border-orange-500/10 dark:bg-slate-900/88 md:p-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
                                Módulo de animais
                            </p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 dark:text-white">
                                Cadastro de animais
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                                Registre os dados do animal para organizar disponibilidade, saúde e fluxo de adoção.
                            </p>

                            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                {[
                                    { label: "Registros", value: String(animals.length) },
                                    { label: "Disponíveis", value: String(animals.filter((animal) => animal.status === "Disponível").length) },
                                    { label: "Em processo", value: String(animals.filter((animal) => animal.status === "Em processo").length) },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/70"
                                    >
                                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">
                                            {item.label}
                                        </p>
                                        <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 dark:text-white">
                                            {item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <AnimalRegistrationForm
                            onCreate={(animal) => {
                                setAnimals((current) => [animal, ...current]);
                            }}
                        />

                        <div className="xl:col-span-2">
                            <AnimalCards animals={animals} />
                        </div>
                    </div>
                </main>
            </AdminLayout>
        </>
    );
}
