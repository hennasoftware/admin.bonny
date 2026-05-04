import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { AdminLayout } from "@/modules/dashboard/AdminLayout";
import { ConfirmDeleteModal, EntityAlert, EntityPageHeader, EntityPageShell, EntityStatsGrid, useToast } from "@/shared/components/ui";
import { AdopterEditorModal, AdoptersList, AdoptersToolbar } from "../components";
import { getAdoptersByStatus, getAdoptersPage, matchesSearch, removeAdopter, updateAdopter } from "../services/service";
import type { AdopterFormState, AdopterRecord, AdopterStatus } from "../types";

const ITEMS_PER_PAGE = 10;

export function AdoptersListPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [page, setPage] = useState(1);
    const [adopters, setAdopters] = useState<AdopterRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<AdopterStatus | "Todos">("Todos");
    const [editingAdopter, setEditingAdopter] = useState<AdopterRecord | null>(null);
    const [adopterToDelete, setAdopterToDelete] = useState<AdopterRecord | null>(null);
    const [saving, setSaving] = useState(false);
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

        const load = async () => {
            setLoading(true);

            try {
                if (search.trim()) {
                    const allAdopters = await getAdoptersByStatus(status);
                    const filteredAdopters = allAdopters.filter((adopter) => matchesSearch(adopter, search));
                    const start = (page - 1) * ITEMS_PER_PAGE;
                    const end = start + ITEMS_PER_PAGE;

                    if (!active) return;

                    setAdopters(filteredAdopters.slice(start, end));
                    setTotalItems(filteredAdopters.length);
                    setHasNextPage(end < filteredAdopters.length);
                } else {
                    const response = await getAdoptersPage(ITEMS_PER_PAGE, cursorHistory[page - 1], status);

                    if (!active) return;

                    setAdopters(response.data);
                    setTotalItems(response.total);
                    setHasNextPage(response.hasNextPage);

                    if (response.hasNextPage && response.nextCursor && cursorHistory.length === page) {
                        setCursorHistory((current) => [...current, response.nextCursor]);
                    }
                }

                setError(null);
            } catch (loadError) {
                if (!active) return;
                setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar os adotantes.");
            } finally {
                if (active) setLoading(false);
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, [page, search, status]);

    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const stats = useMemo(
        () => ({
            total: totalItems,
            active: status === "Todos" || status === "Ativo" ? adopters.filter((adopter) => adopter.status === "Ativo").length : 0,
            inactive: status === "Todos" || status === "Inativo" ? adopters.filter((adopter) => adopter.status === "Inativo").length : 0,
            blocked: status === "Todos" || status === "Bloqueado" ? adopters.filter((adopter) => adopter.status === "Bloqueado").length : 0,
        }),
        [adopters, status, totalItems],
    );

    const handlePageChange = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages) return;
        if (!search.trim() && nextPage > page && !hasNextPage) return;
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
            setCursorHistory([null]);
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

        try {
            await updateAdopter(adopterId, values);
            setEditingAdopter(null);
            setError(null);
            showToast("Adotante atualizado com sucesso.");
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
                        <AdoptersToolbar search={search} status={status} onSearchChange={setSearch} onStatusChange={(value) => setStatus(value as AdopterStatus | "Todos")} />
                    </div>

                    <AdoptersList
                        adopters={adopters}
                        loading={loading}
                        page={page}
                        totalPages={totalPages}
                        hasNextPage={hasNextPage}
                        onPageChange={handlePageChange}
                        onEdit={setEditingAdopter}
                        onDelete={setAdopterToDelete}
                    />
                </EntityPageShell>

                <AdopterEditorModal adopter={editingAdopter} loading={saving} onClose={() => setEditingAdopter(null)} onSubmit={handleUpdate} />

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
