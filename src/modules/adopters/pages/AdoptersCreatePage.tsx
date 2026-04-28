import {useState} from "react";
import {Helmet} from "react-helmet-async";
import {useNavigate} from "react-router-dom";
import {AdminLayout} from "@/modules/dashboard/AdminLayout";
import {AdopterForm} from "../components";
import {createAdopter} from "../services/service";
import type {AdopterFormState} from "../types";

export function AdoptersCreatePage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [formKey, setFormKey] = useState(0);

    const handleCreate = async (values: AdopterFormState) => {
        setIsSubmitting(true);
        setSuccessMessage(null);

        try {
            await createAdopter(values);
            setSuccessMessage("Adotante cadastrado com sucesso.");
            setFormKey((current) => current + 1);
        } catch {
            setSuccessMessage("Não foi possível cadastrar o adotante.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Bonny | Cadastro de adotantes</title>
            </Helmet>

            <AdminLayout>
                <main
                    className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-100 px-4 py-20 md:px-8 md:py-10 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
                    <div className="mx-auto w-full max-w-4xl">
                        <div className="mb-6 flex items-center flex-col md:flex-row justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
                                    Adotantes
                                </p>
                                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 dark:text-white">
                                    Cadastro de adotantes
                                </h1>
                                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                    Preencha os dados para criar o registro no Firestore.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/adotantes/lista")}
                                className="rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 shadow-sm transition-colors hover:bg-orange-50 dark:border-gray-700 dark:bg-slate-900 dark:text-orange-300 dark:hover:bg-slate-800"
                            >
                                Ver cadastrados
                            </button>
                        </div>

                        {successMessage && (
                            <div
                                className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                                {successMessage}
                            </div>
                        )}


                        <AdopterForm
                            key={formKey}
                            submitLabel="Cadastrar adotante"
                            loading={isSubmitting}
                            onSubmit={handleCreate}
                        />

                    </div>
                </main>
            </AdminLayout>
        </>
    );
}
