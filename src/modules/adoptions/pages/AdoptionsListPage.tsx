import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AdopterDetailsModal } from "@/modules/adopters/components";
import { getAdopterById } from "@/modules/adopters/services/service";
import type { AdopterRecord } from "@/modules/adopters/types";
import { AnimalDetailsModal } from "@/modules/animals/components";
import { getAnimalById } from "@/modules/animals/services/service";
import type { AnimalRecord } from "@/modules/animals/types/types";
import { AdminLayout } from "@/modules/dashboard/AdminLayout";
import { ConfirmDeleteModal, EntityAlert, EntityPageHeader, EntityPageShell, EntityStatsGrid, useToast } from "@/shared/components/ui";
import { sortByRecent, type SortDirection } from "@/shared/utils/sortByRecent";
import { AdoptionsList } from "../components/AdoptionsList";
import { AdoptionsToolbar } from "../components/AdoptionsToolbar";
import { removeAdoption, subscribeAdoptions, updateAdoptionStatus, type AdoptionRecord, type AdoptionStatus } from "../services/service";

const ITEMS_PER_PAGE = 10;

function matchesSearch(adoption: AdoptionRecord, search: string) {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return (
        adoption.adopterName.toLowerCase().includes(query) ||
        adoption.animalName.toLowerCase().includes(query) ||
        (adoption.animalCode ?? "").toLowerCase().includes(query) ||
        adoption.id.toLowerCase().includes(query)
    );
}

export function AdoptionsListPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { showToast } = useToast();
    const [page, setPage] = useState(1);
    const [allItems, setAllItems] = useState<AdoptionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
    const [status, setStatus] = useState<AdoptionStatus | "Todos">("Todos");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [adoptionToDelete, setAdoptionToDelete] = useState<AdoptionRecord | null>(null);
    const [viewingAnimal, setViewingAnimal] = useState<AnimalRecord | null>(null);
    const [viewingAdopter, setViewingAdopter] = useState<AdopterRecord | null>(null);
    const [deleting, setDeleting] = useState(false);
    const lastSearchParamRef = useRef(searchParams.get("search") ?? "");

    useEffect(() => {
        const querySearch = searchParams.get("search") ?? "";
        if (querySearch !== lastSearchParamRef.current) {
            lastSearchParamRef.current = querySearch;
            setSearch(querySearch);
        }
    }, [searchParams]);

    useEffect(() => {
        setPage(1);
    }, [search, status, sortDirection]);

    useEffect(() => {
        setLoading(true);

        const unsubscribe = subscribeAdoptions(
            (next) => {
                setAllItems(next);
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

    const filteredItems = useMemo(() => {
        const items = search.trim() ? allItems.filter((adoption) => matchesSearch(adoption, search)) : allItems;
        return sortByRecent(items, sortDirection);
    }, [allItems, search, sortDirection]);

    const totalItems = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const hasNextPage = page < totalPages;
    const items = useMemo(() => filteredItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE), [filteredItems, page]);

    const stats = useMemo(
        () => ({
            total: totalItems,
            open: filteredItems.filter((item) => item.status !== "Concluida").length,
            completed: filteredItems.filter((item) => item.status === "Concluida").length,
        }),
        [filteredItems, totalItems],
    );

    const handlePageChange = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages) return;
        setPage(nextPage);
    };

    const handleDelete = async () => {
        if (!adoptionToDelete) return;
        setDeleting(true);

        try {
            await removeAdoption(adoptionToDelete.id);
            setAdoptionToDelete(null);
            showToast("Adocao removida com sucesso.");
            setPage(1);
        } catch (deleteError) {
            const message = deleteError instanceof Error ? deleteError.message : "Nao foi possivel remover a adocao.";
            setError(message);
            showToast(message, "error");
        } finally {
            setDeleting(false);
        }
    };

    const handleStatusChange = async (adoption: AdoptionRecord, nextStatus: AdoptionStatus) => {
        if (adoption.status === nextStatus) return;

        try {
            await updateAdoptionStatus(adoption.id, nextStatus);
            showToast("Status da adocao atualizado.");
        } catch (statusError) {
            const message = statusError instanceof Error ? statusError.message : "Nao foi possivel atualizar o status.";
            setError(message);
            showToast(message, "error");
        }
    };

    const handleViewAnimal = async (animalId: string) => {
        try {
            const animal = await getAnimalById(animalId);
            if (!animal) {
                showToast("Animal nao encontrado.", "error");
                return;
            }

            setViewingAnimal(animal);
        } catch {
            showToast("Nao foi possivel carregar os detalhes do animal.", "error");
        }
    };

    const handleViewAdopter = async (adopterId: string) => {
        try {
            const adopter = await getAdopterById(adopterId);
            if (!adopter) {
                showToast("Adotante nao encontrado.", "error");
                return;
            }

            setViewingAdopter(adopter);
        } catch {
            showToast("Nao foi possivel carregar os detalhes do adotante.", "error");
        }
    };

    return (
        <>
            <Helmet>
                <title>Bonny | Adocoes</title>
            </Helmet>

            <AdminLayout>
                <EntityPageShell>
                    <EntityPageHeader
                        eyebrow="Adocoes"
                        title="Adocoes registradas"
                        description="Acompanhe o pipeline, evolua status e remova apenas registros ainda nao concluidos."
                        action={
                            <button
                                type="button"
                                onClick={() => navigate("/adocoes/cadastro")}
                                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 shadow-sm transition-colors hover:bg-orange-50 md:w-auto dark:border-gray-700 dark:bg-slate-900 dark:text-orange-300 dark:hover:bg-slate-800"
                            >
                                Nova adocao
                            </button>
                        }
                    />

                    <EntityStatsGrid
                        items={[
                            { label: "Total", value: stats.total },
                            { label: "Em andamento", value: stats.open },
                            { label: "Concluidas", value: stats.completed },
                        ]}
                    />

                    {error ? <EntityAlert tone="error">{error}</EntityAlert> : null}

                    <div className="mb-6">
                        <AdoptionsToolbar
                            search={search}
                            status={status}
                            sortDirection={sortDirection}
                            onSearchChange={setSearch}
                            onStatusChange={setStatus}
                            onSortDirectionChange={setSortDirection}
                        />
                    </div>

                    <AdoptionsList
                        adoptions={items}
                        loading={loading}
                        page={page}
                        totalPages={totalPages}
                        hasNextPage={hasNextPage}
                        onPageChange={handlePageChange}
                        onViewAdopter={handleViewAdopter}
                        onViewAnimal={handleViewAnimal}
                        onDelete={setAdoptionToDelete}
                        onStatusChange={handleStatusChange}
                    />
                </EntityPageShell>

                <AdopterDetailsModal adopter={viewingAdopter} onClose={() => setViewingAdopter(null)} />
                <AnimalDetailsModal animal={viewingAnimal} onClose={() => setViewingAnimal(null)} />

                <ConfirmDeleteModal
                    open={!!adoptionToDelete}
                    title="Excluir adocao"
                    description="Confirme a exclusao do registro de adocao."
                    itemLabel={adoptionToDelete ? `${adoptionToDelete.adopterName} / ${adoptionToDelete.animalName}` : undefined}
                    loading={deleting}
                    onClose={() => setAdoptionToDelete(null)}
                    onConfirm={handleDelete}
                />
            </AdminLayout>
        </>
    );
}
