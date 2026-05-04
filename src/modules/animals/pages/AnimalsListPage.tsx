import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
// firebase types not required in this module after switching to client-side pagination from subscriptions
import { AdminLayout } from "@/modules/dashboard/AdminLayout";
import { ConfirmDeleteModal, EntityAlert, EntityPageHeader, EntityPageShell, EntityStatsGrid, useToast } from "@/shared/components/ui";
import { AnimalEditorModal, AnimalList, AnimalsToolbar } from "../components";
import { getAnimalsByStatus, matchesSearch, removeAnimal, updateAnimal, subscribeAnimals } from "../services/service";
import { ANIMAL_DATA } from "../constants/animalData";
import type { AnimalFormState, AnimalRecord, AnimalStatus } from "../types/types";

const ITEMS_PER_PAGE = 10;

export function AnimalsListPage() {
    const availableStatus = ANIMAL_DATA.status[0].value as AnimalStatus;
    const inProcessStatus = ANIMAL_DATA.status[1].value as AnimalStatus;
    const adoptedStatus = ANIMAL_DATA.status[2].value as AnimalStatus;
    const navigate = useNavigate();
    const { showToast } = useToast();
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
    const [totalItems, setTotalItems] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);

    useEffect(() => {
        setPage(1);
    }, [search, status]);

    useEffect(() => {
        let active = true;
        let unsub: (() => void) | undefined;

        const load = async () => {
            setLoading(true);

            try {
                if (search.trim()) {
                    const allAnimals = await getAnimalsByStatus(status);
                    const filteredAnimals = allAnimals.filter((animal) => matchesSearch(animal, search));
                    const start = (page - 1) * ITEMS_PER_PAGE;
                    const end = start + ITEMS_PER_PAGE;

                    if (!active) return;

                    setAnimals(filteredAnimals.slice(start, end));
                    setTotalItems(filteredAnimals.length);
                    setHasNextPage(end < filteredAnimals.length);
                } else {
                    unsub = subscribeAnimals(
                        (next) => {
                            if (!active) return;
                            const start = (page - 1) * ITEMS_PER_PAGE;
                            const end = start + ITEMS_PER_PAGE;
                            setTotalItems(next.length);
                            setHasNextPage(end < next.length);
                            setAnimals(next.slice(start, end));
                            setError(null);
                            setLoading(false);
                        },
                        (err) => {
                            if (!active) return;
                            setError(err.message);
                            setLoading(false);
                        },
                        status,
                    );
                }

                setError(null);
            } catch (loadError) {
                if (!active) return;
                setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar os animais.");
            } finally {
                if (active && !unsub) setLoading(false);
            }
        };

        void load();

        return () => {
            active = false;
            unsub?.();
        };
    }, [page, search, status]);

    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

    const stats = useMemo(
        () => ({
            total: totalItems,
            available: status === "Todos" || status === availableStatus ? animals.filter((animal) => animal.status === availableStatus).length : 0,
            inProcess: status === "Todos" || status === inProcessStatus ? animals.filter((animal) => animal.status === inProcessStatus).length : 0,
            adopted: status === "Todos" || status === adoptedStatus ? animals.filter((animal) => animal.status === adoptedStatus).length : 0,
        }),
        [adoptedStatus, animals, availableStatus, inProcessStatus, status, totalItems],
    );

    const handlePageChange = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages) return;
        if (!search.trim() && nextPage > page && !hasNextPage) return;
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
                        <AnimalsToolbar search={search} status={status} onSearchChange={setSearch} onStatusChange={setStatus} />
                    </div>

                    <AnimalList
                        animals={animals}
                        loading={loading}
                        page={page}
                        totalPages={totalPages}
                        hasNextPage={hasNextPage}
                        onPageChange={handlePageChange}
                        onEdit={setEditingAnimal}
                        onDelete={setAnimalToDelete}
                    />
                </EntityPageShell>

                <AnimalEditorModal animal={editingAnimal} loading={saving} onClose={() => setEditingAnimal(null)} onSubmit={handleUpdate} />

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
