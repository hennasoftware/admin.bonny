import { Helmet } from "react-helmet-async";
import { AdminLayout } from "./AdminLayout";

interface ModulePlaceholderPageProps {
    title: string;
    description: string;
}

export function ModulePlaceholderPage({ title, description }: ModulePlaceholderPageProps) {
    return (
        <>
            <Helmet>
                <title>Bonny | {title}</title>
            </Helmet>

            <AdminLayout>
                <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-100 px-4 py-20 md:px-8 md:py-10 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
                    <div className="mx-auto max-w-5xl">
                        <section className="rounded-4xl border border-orange-100 bg-white/92 p-8 shadow-sm dark:border-orange-500/10 dark:bg-slate-900/88 md:p-12">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
                                Módulo
                            </p>
                            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-950 dark:text-white">
                                {title}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                                {description}
                            </p>

                            <div className="mt-10 grid gap-4 md:grid-cols-3">
                                {[
                                    "Estrutura de listagem",
                                    "Filtros e busca",
                                    "Ações do fluxo",
                                ].map((item) => (
                                    <div
                                        key={item}
                                        className="rounded-2xl border border-orange-100 bg-orange-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/70"
                                    >
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {item}
                                        </p>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Área preparada para expansão do módulo.
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </main>
            </AdminLayout>
        </>
    );
}
