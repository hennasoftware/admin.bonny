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
import { AdopterEditorModal, AdoptersList, AdoptersToolbar } from "../components";
import {
    matchesSearch,
    matchesStatus,
    removeAdopter,
    subscribeAdopters,
    updateAdopter,
} from "../services/service";
import type { AdopterFormState, AdopterRecord, AdopterStatus } from "../types";

export function AdoptersListPage() {
    const navigate = useNavigate();
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

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const unsubscribe = subscribeAdopters(
            (nextAdopters) => {
                setAdopters(nextAdopters);
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

    const filteredAdopters = useMemo(
        () => adopters.filter((adopter) => matchesSearch(adopter, search) && matchesStatus(adopter, status)),
        [adopters, search, status],
    );

    const { paginatedAdopters, totalPages } = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return {
            paginatedAdopters: filteredAdopters.slice(start, end),
            totalPages: Math.ceil(filteredAdopters.length / ITEMS_PER_PAGE) || 1,
        };
    }, [filteredAdopters, page]);

    const stats = useMemo(
        () => ({
            total: filteredAdopters.length,
            active: filteredAdopters.filter((adopter) => adopter.status === "Ativo").length,
            inactive: filteredAdopters.filter((adopter) => adopter.status === "Inativo").length,
            blocked: filteredAdopters.filter((adopter) => adopter.status === "Bloqueado").length,
        }),
        [filteredAdopters],
    );

    const handleDelete = async () => {
        if (!adopterToDelete) return;
        setDeleting(true);
        try {
            await removeAdopter(adopterToDelete.id);
            setAdopterToDelete(null);
        } catch {
            setError("NÃ£o foi possÃ­vel excluir o adotante.");
        } finally {
            setDeleting(false);
        }
    };

    const handleUpdate = async (adopterId: string, values: AdopterFormState) => {
        setSaving(true);

        try {
            await updateAdopter(adopterId, values);
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
                            onSearchChange={setSearch}
                            onStatusChange={(newStatus) => setStatus(newStatus as AdopterStatus | "Todos")}
                        />
                    </div>

                    <AdoptersList
                        adopters={paginatedAdopters}
                        loading={loading}
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        onEdit={setEditingAdopter}
                        onDelete={setAdopterToDelete}
                    />
                </EntityPageShell>

                <AdopterEditorModal
                    adopter={editingAdopter}
                    loading={saving}
                    onClose={() => setEditingAdopter(null)}
                    onSubmit={handleUpdate}
                />

                <ConfirmDeleteModal
                    open={!!adopterToDelete}
                    title="Excluir adotante"
                    description="Confirme a exclusão do cadastro do adotante."
                    itemLabel={adopterToDelete?.name}
                    loading={deleting}
                    onClose={() => setAdopterToDelete(null)}
                    onConfirm={handleDelete}
                />
            </AdminLayout>
        </>
    );
}
