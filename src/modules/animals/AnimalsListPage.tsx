import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/modules/dashboard/AdminLayout";
import { AnimalEditorModal, AnimalList, AnimalsToolbar } from "./components";
import {
    matchesSearch,
    matchesStatus,
    removeAnimal,
    subscribeAnimals,
    updateAnimal,
} from "./service";
import type { AnimalFormState, AnimalRecord, AnimalStatus } from "./types";

export function AnimalsListPage() {
    const navigate = useNavigate();
    const [animals, setAnimals] = useState<AnimalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<AnimalStatus | "Todos">("Todos");
    const [editingAnimal, setEditingAnimal] = useState<AnimalRecord | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeAnimals(
            (nextAnimals) => {
                setAnimals(nextAnimals);
                setLoading(false);
                setError(null);
            },
            (subscriptionError) => {
                setError(subscriptionError.message);
                setLoading(false);
            },
        );

        return () => unsubscribe();
    }, []);

    const filteredAnimals = useMemo(
        () => animals.filter((animal) => matchesSearch(animal, search) && matchesStatus(animal, status)),
        [animals, search, status],
    );

    const stats = useMemo(
        () => ({
            total: animals.length,
            available: animals.filter((animal) => animal.status === "Disponível").length,
            inProcess: animals.filter((animal) => animal.status === "Em processo").length,
            adopted: animals.filter((animal) => animal.status === "Adotado").length,
        }),
        [animals],
    );

    const handleDelete = async (animal: AnimalRecord) => {
        if (!window.confirm(`Excluir ${animal.name}?`)) return;

        try {
            await removeAnimal(animal.id);
        } catch {
            setError("Não foi possível excluir o animal.");
        }
    };

    const handleUpdate = async (animalId: string, values: AnimalFormState) => {
        setSaving(true);

        try {
            await updateAnimal(animalId, values);
            setError(null);
        } catch {
            setError("Não foi possível salvar as alterações.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Bonny | Animais cadastrados</title>
            </Helmet>

            <AdminLayout>
                <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-100 px-4 py-20 md:px-8 md:py-10 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
                    <div className="mx-auto w-full max-w-7xl">
                        <div className="mb-6 flex items-center flex-col md:flex-row md:justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
                                    Animais
                                </p>
                                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 dark:text-white">
                                    Animais cadastrados
                                </h1>
                                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                    Busque, filtre, edite ou remova registros do Firestore.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/animais/cadastro")}
                                className="rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 shadow-sm transition-colors hover:bg-orange-50 dark:border-gray-700 dark:bg-slate-900 dark:text-orange-300 dark:hover:bg-slate-800"
                            >
                                Novo cadastro
                            </button>
                        </div>

                        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {[
                                { label: "Total", value: stats.total },
                                { label: "Disponíveis", value: stats.available },
                                { label: "Em processo", value: stats.inProcess },
                                { label: "Adotados", value: stats.adopted },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-2xl border border-orange-100 bg-white/92 p-4 shadow-sm dark:border-orange-500/10 dark:bg-slate-900/88"
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

                        {error && (
                            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        <div className="mb-6">
                            <AnimalsToolbar
                                search={search}
                                status={status}
                                onSearchChange={setSearch}
                                onStatusChange={setStatus}
                            />
                        </div>

                        <AnimalList
                            animals={filteredAnimals}
                            loading={loading}
                            onEdit={setEditingAnimal}
                            onDelete={handleDelete}
                        />
                    </div>
                </main>

                <AnimalEditorModal
                    animal={editingAnimal}
                    loading={saving}
                    onClose={() => setEditingAnimal(null)}
                    onSubmit={handleUpdate}
                />
            </AdminLayout>
        </>
    );
}
