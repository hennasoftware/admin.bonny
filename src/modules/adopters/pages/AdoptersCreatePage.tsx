import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/modules/dashboard/AdminLayout";
import { EntityPageHeader, EntityPageShell, useToast } from "@/shared/components/ui";
import { AdopterForm } from "../components";
import { createAdopter } from "../services/service";
import type { AdopterFormState } from "../types";

export function AdoptersCreatePage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formKey, setFormKey] = useState(0);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleCreate = async (values: AdopterFormState) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            await createAdopter(values);
            showToast("Adotante cadastrado com sucesso.");
            setFormKey((current) => current + 1);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Nao foi possivel cadastrar o adotante.";
            setSubmitError(message);
            showToast(message, "error");
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
                <EntityPageShell maxWidth="4xl">
                    <EntityPageHeader
                        eyebrow="Adotantes"
                        title="Cadastro de adotantes"
                        description="Preencha os dados para criar o registro no Firestore."
                        action={
                            <button
                                type="button"
                                onClick={() => navigate("/adotantes/lista")}
                                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 shadow-sm transition-colors hover:bg-orange-50 md:w-auto dark:border-gray-700 dark:bg-slate-900 dark:text-orange-300 dark:hover:bg-slate-800"
                            >
                                Ver cadastrados
                            </button>
                        }
                    />

                    <AdopterForm
                        key={formKey}
                        submitLabel="Cadastrar adotante"
                        loading={isSubmitting}
                        submitError={submitError}
                        onSubmit={handleCreate}
                    />
                </EntityPageShell>
            </AdminLayout>
        </>
    );
}
