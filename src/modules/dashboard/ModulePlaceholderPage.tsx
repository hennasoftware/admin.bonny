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
                <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-100 px-3 py-8 sm:px-4 md:px-8 md:py-10 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
                    <div className="mx-auto max-w-5xl">
                        <section className="rounded-[28px] border border-white/70 bg-white/82 p-6 shadow-[0_18px_50px_-34px_rgb(15_23_42/0.28)] backdrop-blur-sm md:p-10 dark:border-slate-700/60 dark:bg-slate-950/60">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
                                Módulo
                            </p>
                            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl dark:text-white">
                                {title}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                                {description}
                            </p>

                            <div className="mt-8 grid gap-4 md:grid-cols-3">
                                {["Estrutura de listagem", "Filtros e busca", "Ações do fluxo"].map((item) => (
                                    <div
                                        key={item}
                                        className="rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/60"
                                    >
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item}</p>
                                        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
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
