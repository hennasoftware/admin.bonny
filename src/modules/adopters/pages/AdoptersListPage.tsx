import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AdminLayout } from "@/modules/dashboard/AdminLayout";
import { ConfirmDeleteModal, EntityAlert, EntityPageHeader, EntityPageShell, EntityStatsGrid, useToast } from "@/shared/components/ui";
import { sortByRecent, type SortDirection } from "@/shared/utils/sortByRecent";
import { AdopterDetailsModal, AdopterEditorModal, AdoptersList, AdoptersToolbar } from "../components";
import { getAdoptersByStatus, matchesSearch, removeAdopter, updateAdopter } from "../services/service";
import type { AdopterFormState, AdopterRecord, AdopterStatus } from "../types";

const ITEMS_PER_PAGE = 10;

export function AdoptersListPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { showToast } = useToast();
    const [page, setPage] = useState(1);
    const [allAdopters, setAllAdopters] = useState<AdopterRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
    const [status, setStatus] = useState<AdopterStatus | "Todos">("Todos");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [viewingAdopter, setViewingAdopter] = useState<AdopterRecord | null>(null);
    const [editingAdopter, setEditingAdopter] = useState<AdopterRecord | null>(null);
    const [adopterToDelete, setAdopterToDelete] = useState<AdopterRecord | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setPage(1);
    }, [search, status, sortDirection]);

    useEffect(() => {
        const nextSearch = searchParams.get("search") ?? "";
        setSearch((current) => (current === nextSearch ? current : nextSearch));
    }, [searchParams]);

    useEffect(() => {
        let active = true;
        setLoading(true);

        void getAdoptersByStatus(status)
            .then((items) => {
                if (!active) return;
                setAllAdopters(items);
                setError(null);
            })
            .catch((loadError) => {
                if (!active) return;
                setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar os adotantes.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [status]);

    const filteredAdopters = useMemo(() => {
        const items = search.trim() ? allAdopters.filter((adopter) => matchesSearch(adopter, search)) : allAdopters;
        return sortByRecent(items, sortDirection);
    }, [allAdopters, search, sortDirection]);

    const totalItems = filteredAdopters.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const hasNextPage = page < totalPages;
    const adopters = useMemo(() => filteredAdopters.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE), [filteredAdopters, page]);

    const stats = useMemo(
        () => ({
            total: totalItems,
            active: filteredAdopters.filter((adopter) => adopter.status === "Ativo").length,
            inactive: filteredAdopters.filter((adopter) => adopter.status === "Inativo").length,
            blocked: filteredAdopters.filter((adopter) => adopter.status === "Bloqueado").length,
        }),
        [filteredAdopters, totalItems],
    );

    const handlePageChange = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages) return;
        setPage(nextPage);
    };

    const handleDelete = async () => {
        if (!adopterToDelete) return;
        setDeleting(true);

        try {
            await removeAdopter(adopterToDelete.id);
            setAdopterToDelete(null);
            showToast("Adotante removido com sucesso.");
            setPage(1);
        } catch (deleteError) {
            const message = deleteError instanceof Error ? deleteError.message : "Nao foi possivel excluir o adotante.";
            setError(message);
            showToast(message, "error");
        } finally {
            setDeleting(false);
        }
    };

    const handleUpdate = async (adopterId: string, values: AdopterFormState) => {
        setSaving(true);
        setSubmitError(null);

        try {
            await updateAdopter(adopterId, values);
            setEditingAdopter(null);
            setError(null);
            showToast("Adotante atualizado com sucesso.");
            const refreshed = await getAdoptersByStatus(status);
            setAllAdopters(refreshed);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Nao foi possivel salvar as alteracoes.";
            setSubmitError(message);
            setError(message);
            showToast(message, "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Bonny | Adotantes cadastrados</title>
            </Helmet>

            <AdminLayout>
                <EntityPageShell>
                    <EntityPageHeader
                        eyebrow="Adotantes"
                        title="Adotantes cadastrados"
                        description="Busque, filtre, edite ou remova registros do Firestore."
                        action={
                            <button
                                type="button"
                                onClick={() => navigate("/adotantes/cadastro")}
                                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 shadow-sm transition-colors hover:bg-orange-50 md:w-auto dark:border-gray-700 dark:bg-slate-900 dark:text-orange-300 dark:hover:bg-slate-800"
                            >
                                Novo cadastro
                            </button>
                        }
                    />

                    <EntityStatsGrid
                        items={[
                            { label: "Total", value: stats.total },
                            { label: "Ativos", value: stats.active },
                            { label: "Inativos", value: stats.inactive },
                            { label: "Bloqueados", value: stats.blocked },
                        ]}
                    />

                    {error ? <EntityAlert tone="error">{error}</EntityAlert> : null}

                    <div className="mb-6">
                        <AdoptersToolbar
                            search={search}
                            status={status}
                            sortDirection={sortDirection}
                            onSearchChange={setSearch}
                            onStatusChange={(value) => setStatus(value as AdopterStatus | "Todos")}
                            onSortDirectionChange={setSortDirection}
                        />
                    </div>

                    <AdoptersList
                        adopters={adopters}
                        loading={loading}
                        onView={setViewingAdopter}
                        page={page}
                        totalPages={totalPages}
                        hasNextPage={hasNextPage}
                        onPageChange={handlePageChange}
                        onEdit={setEditingAdopter}
                        onDelete={setAdopterToDelete}
                    />
                </EntityPageShell>

                <AdopterDetailsModal adopter={viewingAdopter} onClose={() => setViewingAdopter(null)} />
                <AdopterEditorModal
                    adopter={editingAdopter}
                    loading={saving}
                    submitError={submitError}
                    onClose={() => {
                        setEditingAdopter(null);
                        setSubmitError(null);
                    }}
                    onSubmit={handleUpdate}
                />

                <ConfirmDeleteModal
                    open={!!adopterToDelete}
                    title="Excluir adotante"
                    description="Confirme a exclusao do cadastro do adotante."
                    itemLabel={adopterToDelete?.name}
                    loading={deleting}
                    onClose={() => setAdopterToDelete(null)}
                    onConfirm={handleDelete}
                />
            </AdminLayout>
        </>
    );
}
