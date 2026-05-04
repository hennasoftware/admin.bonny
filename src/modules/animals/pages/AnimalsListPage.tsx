import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/modules/dashboard/AdminLayout";
import {
    ConfirmDeleteModal,
    EntityAlert,
    EntityPageHeader,
    EntityPageShell,
    EntityStatsGrid,
} from "@/shared/components/ui";
import { AnimalEditorModal, AnimalList, AnimalsToolbar } from "../components";
import {
    matchesSearch,
    matchesStatus,
    removeAnimal,
    subscribeAnimals,
    updateAnimal,
} from "../services/service";
import { ANIMAL_DATA } from "../constants/animalData";
import type { AnimalFormState, AnimalRecord, AnimalStatus } from "../types/types";

export function AnimalsListPage() {
    const availableStatus = ANIMAL_DATA.status[0].value as AnimalStatus;
    const inProcessStatus = ANIMAL_DATA.status[1].value as AnimalStatus;
    const adoptedStatus = ANIMAL_DATA.status[2].value as AnimalStatus;
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [animals, setAnimals] = useState<AnimalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<AnimalStatus | "Todos">("Todos");
    const [editingAnimal, setEditingAnimal] = useState<AnimalRecord | null>(null);
    const [animalToDelete, setAnimalToDelete] = useState<AnimalRecord | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const ITEMS_PER_PAGE = 10;

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

    useEffect(() => {
        setPage(1);
    }, [search, status]);

    const filteredAnimals = useMemo(
        () => animals.filter((animal) => matchesSearch(animal, search) && matchesStatus(animal, status)),
        [animals, search, status],
    );

    const { paginatedAnimals, totalPages } = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return {
            paginatedAnimals: filteredAnimals.slice(start, end),
            totalPages: Math.ceil(filteredAnimals.length / ITEMS_PER_PAGE) || 1,
        };
    }, [filteredAnimals, page]);

    const stats = useMemo(
        () => ({
            total: filteredAnimals.length,
            available: filteredAnimals.filter((animal) => animal.status === availableStatus).length,
            inProcess: filteredAnimals.filter((animal) => animal.status === inProcessStatus).length,
            adopted: filteredAnimals.filter((animal) => animal.status === adoptedStatus).length,
        }),
        [adoptedStatus, availableStatus, filteredAnimals, inProcessStatus],
    );

    const handleDelete = async () => {
        if (!animalToDelete) return;
        setDeleting(true);
        try {
            await removeAnimal(animalToDelete.id);
            setAnimalToDelete(null);
        } catch {
            setError("NÃ£o foi possÃ­vel excluir o animal.");
        } finally {
            setDeleting(false);
        }
    };

    const handleUpdate = async (animalId: string, values: AnimalFormState) => {
        setSaving(true);

        try {
            await updateAnimal(animalId, values);
            setError(null);
        } catch {
            setError("NÃ£o foi possÃ­vel salvar as alteraÃ§Ãµes.");
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
                <EntityPageShell>
                    <EntityPageHeader
                        eyebrow="Animais"
                        title="Animais cadastrados"
                        description="Busque, filtre, edite ou remova registros do Firestore."
                        action={
                            <button
                                type="button"
                                onClick={() => navigate("/animais/cadastro")}
                                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 shadow-sm transition-colors hover:bg-orange-50 md:w-auto dark:border-gray-700 dark:bg-slate-900 dark:text-orange-300 dark:hover:bg-slate-800"
                            >
                                Novo cadastro
                            </button>
                        }
                    />

                    <EntityStatsGrid
                        items={[
                            { label: "Total", value: stats.total },
                            { label: "DisponÃ­veis", value: stats.available },
                            { label: "Em processo", value: stats.inProcess },
                            { label: "Adotados", value: stats.adopted },
                        ]}
                    />

                    {error ? <EntityAlert tone="error">{error}</EntityAlert> : null}

                    <div className="mb-6">
                        <AnimalsToolbar
                            search={search}
                            status={status}
                            onSearchChange={setSearch}
                            onStatusChange={setStatus}
                        />
                    </div>

                    <AnimalList
                        animals={paginatedAnimals}
                        loading={loading}
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        onEdit={setEditingAnimal}
                        onDelete={setAnimalToDelete}
                    />
                </EntityPageShell>

                <AnimalEditorModal
                    animal={editingAnimal}
                    loading={saving}
                    onClose={() => setEditingAnimal(null)}
                    onSubmit={handleUpdate}
                />

                <ConfirmDeleteModal
                    open={!!animalToDelete}
                    title="Excluir animal"
                    description="Confirme a exclusão do cadastro do animal."
                    itemLabel={animalToDelete?.name}
                    loading={deleting}
                    onClose={() => setAnimalToDelete(null)}
                    onConfirm={handleDelete}
                />
            </AdminLayout>
        </>
    );
}
