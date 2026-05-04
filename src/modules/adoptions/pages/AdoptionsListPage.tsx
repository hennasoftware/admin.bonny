import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { AdminLayout } from "@/modules/dashboard/AdminLayout";
import { ConfirmDeleteModal, EntityAlert, EntityPageHeader, EntityPageShell, EntityStatsGrid, useToast } from "@/shared/components/ui";
import { AdoptionsList } from "../components/AdoptionsList";
import { AdoptionsToolbar } from "../components/AdoptionsToolbar";
import { getAdoptionsByStatus, removeAdoption, updateAdoptionStatus, subscribeAdoptions, type AdoptionRecord, type AdoptionStatus } from "../services/service";

const ITEMS_PER_PAGE = 10;

function matchesSearch(adoption: AdoptionRecord, search: string) {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return (
        adoption.adopterName.toLowerCase().includes(query) ||
        adoption.animalName.toLowerCase().includes(query) ||
        adoption.id.toLowerCase().includes(query)
    );
}

export function AdoptionsListPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [page, setPage] = useState(1);
    const [items, setItems] = useState<AdoptionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<AdoptionStatus | "Todos">("Todos");
    const [adoptionToDelete, setAdoptionToDelete] = useState<AdoptionRecord | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [cursorHistory, setCursorHistory] = useState<Array<QueryDocumentSnapshot<DocumentData> | null>>([null]);

    useEffect(() => {
        setPage(1);
        setCursorHistory([null]);
    }, [search, status]);

    useEffect(() => {
        let active = true;
        let unsub: (() => void) | undefined;

        const load = async () => {
            setLoading(true);

            try {
                if (search.trim()) {
                    const allAdoptions = await getAdoptionsByStatus(status);
                    const filtered = allAdoptions.filter((adoption) => matchesSearch(adoption, search));
                    const start = (page - 1) * ITEMS_PER_PAGE;
                    const end = start + ITEMS_PER_PAGE;

                    if (!active) return;

                    setItems(filtered.slice(start, end));
                    setTotalItems(filtered.length);
                    setHasNextPage(end < filtered.length);
                } else {
                    unsub = subscribeAdoptions(
                        (next) => {
                            if (!active) return;
                            const start = (page - 1) * ITEMS_PER_PAGE;
                            const end = start + ITEMS_PER_PAGE;
                            setTotalItems(next.length);
                            setHasNextPage(end < next.length);
                            setItems(next.slice(start, end));
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
                setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar as adocoes.");
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
            open: items.filter((item) => item.status !== "Concluida").length,
            completed: items.filter((item) => item.status === "Concluida").length,
        }),
        [items, totalItems],
    );

    const handlePageChange = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages) return;
        if (!search.trim() && nextPage > page && !hasNextPage) return;
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
            setCursorHistory([null]);
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
                        <AdoptionsToolbar search={search} status={status} onSearchChange={setSearch} onStatusChange={setStatus} />
                    </div>

                    <AdoptionsList
                        adoptions={items}
                        loading={loading}
                        page={page}
                        totalPages={totalPages}
                        hasNextPage={hasNextPage}
                        onPageChange={handlePageChange}
                        onDelete={setAdoptionToDelete}
                        onStatusChange={handleStatusChange}
                    />
                </EntityPageShell>

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
