import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/modules/dashboard/AdminLayout";
import { EntityPageHeader, EntityPageShell, useToast } from "@/shared/components/ui";
import { AnimalForm } from "../components";
import { createAnimal } from "../services/service";
import type { AnimalFormState } from "../types/types";

export function AnimalsCreatePage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formKey, setFormKey] = useState(0);

    const handleCreate = async (values: AnimalFormState) => {
        setIsSubmitting(true);

        try {
            const { animalCode } = await createAnimal(values);
            showToast(`Animal cadastrado com sucesso. Codigo: ${animalCode}.`);
            setFormKey((current) => current + 1);
        } catch {
            showToast("Nao foi possivel cadastrar o animal.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Bonny | Cadastro de animais</title>
            </Helmet>

            <AdminLayout>
                <EntityPageShell maxWidth="4xl">
                    <EntityPageHeader
                        eyebrow="Animais"
                        title="Cadastro de animais"
                        description="Preencha os dados para criar o registro no Firestore."
                        action={
                            <button
                                type="button"
                                onClick={() => navigate("/animais/lista")}
                                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 shadow-sm transition-colors hover:bg-orange-50 md:w-auto dark:border-gray-700 dark:bg-slate-900 dark:text-orange-300 dark:hover:bg-slate-800"
                            >
                                Ver cadastrados
                            </button>
                        }
                    />

                    <AnimalForm key={formKey} submitLabel="Cadastrar animal" loading={isSubmitting} onSubmit={handleCreate} />
                </EntityPageShell>
            </AdminLayout>
        </>
    );
}
