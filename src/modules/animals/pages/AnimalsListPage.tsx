import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/modules/dashboard/AdminLayout";
import { ConfirmDeleteModal, EntityAlert, EntityPageHeader, EntityPageShell, EntityStatsGrid, useToast } from "@/shared/components/ui";
import { sortByRecent, type SortDirection } from "@/shared/utils/sortByRecent";
import { ANIMAL_DATA } from "../constants/animalData";
import { AnimalDetailsModal, AnimalEditorModal, AnimalList, AnimalsToolbar } from "../components";
import { matchesSearch, removeAnimal, subscribeAnimals, updateAnimal } from "../services/service";
import type { AnimalFormState, AnimalRecord, AnimalStatus } from "../types/types";

const ITEMS_PER_PAGE = 10;

export function AnimalsListPage() {
    const availableStatus = ANIMAL_DATA.status[0].value as AnimalStatus;
    const inProcessStatus = ANIMAL_DATA.status[1].value as AnimalStatus;
    const adoptedStatus = ANIMAL_DATA.status[2].value as AnimalStatus;
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [page, setPage] = useState(1);
    const [allAnimals, setAllAnimals] = useState<AnimalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<AnimalStatus | "Todos">("Todos");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [editingAnimal, setEditingAnimal] = useState<AnimalRecord | null>(null);
    const [viewingAnimal, setViewingAnimal] = useState<AnimalRecord | null>(null);
    const [animalToDelete, setAnimalToDelete] = useState<AnimalRecord | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setPage(1);
    }, [search, status, sortDirection]);

    useEffect(() => {
        setLoading(true);

        const unsubscribe = subscribeAnimals(
            (next) => {
                setAllAnimals(next);
                setError(null);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            },
            status,
        );

        return unsubscribe;
    }, [status]);

    const filteredAnimals = useMemo(() => {
        const items = search.trim() ? allAnimals.filter((animal) => matchesSearch(animal, search)) : allAnimals;
        return sortByRecent(items, sortDirection);
    }, [allAnimals, search, sortDirection]);

    const totalItems = filteredAnimals.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const hasNextPage = page < totalPages;
    const animals = useMemo(() => filteredAnimals.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE), [filteredAnimals, page]);

    const stats = useMemo(
        () => ({
            total: totalItems,
            available: filteredAnimals.filter((animal) => animal.status === availableStatus).length,
            inProcess: filteredAnimals.filter((animal) => animal.status === inProcessStatus).length,
            adopted: filteredAnimals.filter((animal) => animal.status === adoptedStatus).length,
        }),
        [adoptedStatus, availableStatus, filteredAnimals, inProcessStatus, totalItems],
    );

    const handlePageChange = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages) return;
        setPage(nextPage);
    };

    const handleDelete = async () => {
        if (!animalToDelete) return;
        setDeleting(true);

        try {
            await removeAnimal(animalToDelete.id);
            setAnimalToDelete(null);
            showToast("Animal removido com sucesso.");
            setPage(1);
        } catch (deleteError) {
            const message = deleteError instanceof Error ? deleteError.message : "Nao foi possivel excluir o animal.";
            setError(message);
            showToast(message, "error");
        } finally {
            setDeleting(false);
        }
    };

    const handleUpdate = async (animalId: string, values: AnimalFormState) => {
        setSaving(true);

        try {
            await updateAnimal(animalId, values);
            setEditingAnimal(null);
            setError(null);
            showToast("Animal atualizado com sucesso.");
        } catch {
            const message = "Nao foi possivel salvar as alteracoes.";
            setError(message);
            showToast(message, "error");
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
                            { label: "Disponiveis", value: stats.available },
                            { label: "Em processo", value: stats.inProcess },
                            { label: "Adotados", value: stats.adopted },
                        ]}
                    />

                    {error ? <EntityAlert tone="error">{error}</EntityAlert> : null}

                    <div className="mb-6">
                        <AnimalsToolbar
                            search={search}
                            status={status}
                            sortDirection={sortDirection}
                            onSearchChange={setSearch}
                            onStatusChange={setStatus}
                            onSortDirectionChange={setSortDirection}
                        />
                    </div>

                    <AnimalList
                        animals={animals}
                        loading={loading}
                        onView={setViewingAnimal}
                        page={page}
                        totalPages={totalPages}
                        hasNextPage={hasNextPage}
                        onPageChange={handlePageChange}
                        onEdit={setEditingAnimal}
                        onDelete={setAnimalToDelete}
                    />
                </EntityPageShell>

                <AnimalEditorModal animal={editingAnimal} loading={saving} onClose={() => setEditingAnimal(null)} onSubmit={handleUpdate} />
                <AnimalDetailsModal animal={viewingAnimal} onClose={() => setViewingAnimal(null)} />

                <ConfirmDeleteModal
                    open={!!animalToDelete}
                    title="Excluir animal"
                    description="Confirme a exclusao do cadastro do animal."
                    itemLabel={animalToDelete?.name}
                    loading={deleting}
                    onClose={() => setAnimalToDelete(null)}
                    onConfirm={handleDelete}
                />
            </AdminLayout>
        </>
    );
}
