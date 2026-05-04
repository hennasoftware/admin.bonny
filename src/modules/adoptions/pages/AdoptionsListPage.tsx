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
import { subscribeAdoptions, removeAdoption } from "@/modules/adoptions/services/service";
import { AdoptionsList } from "../components/AdoptionsList";
import type { AdoptionRecord } from "../services/service";

export function AdoptionsListPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [items, setItems] = useState<AdoptionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [adoptionToDelete, setAdoptionToDelete] = useState<AdoptionRecord | null>(null);
    const [deleting, setDeleting] = useState(false);

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const unsub = subscribeAdoptions(
            (next) => {
                setItems(next);
                setLoading(false);
                setError(null);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsub();
    }, []);

    useEffect(() => setPage(1), [search]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter(
            (it) =>
                (it.adopterName || "").toLowerCase().includes(q) ||
                (it.animalName || "").toLowerCase().includes(q) ||
                (it.id || "").toLowerCase().includes(q),
        );
    }, [items, search]);

    const { paginated, totalPages } = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return {
            paginated: filtered.slice(start, end),
            totalPages: Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE)),
        };
    }, [filtered, page]);

    const stats = useMemo(
        () => ({
            total: filtered.length,
            pageItems: paginated.length,
        }),
        [filtered.length, paginated.length],
    );

    const handleDelete = async () => {
        if (!adoptionToDelete) return;
        setDeleting(true);
        try {
            await removeAdoption(adoptionToDelete.id);
            setAdoptionToDelete(null);
        } catch {
            setError("Não foi possível remover a adoção.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Bonny | Adoções</title>
            </Helmet>

            <AdminLayout>
                <EntityPageShell>
                    <EntityPageHeader
                        eyebrow="Adoções"
                        title="Adoções registradas"
                        description="Uma visualização mais limpa, compacta e funcional para desktop e mobile."
                        action={
                            <button
                                type="button"
                                onClick={() => navigate("/adocoes/cadastro")}
                                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 shadow-sm transition-colors hover:bg-orange-50 md:w-auto dark:border-gray-700 dark:bg-slate-900 dark:text-orange-300 dark:hover:bg-slate-800"
                            >
                                Nova adoção
                            </button>
                        }
                    />

                    <EntityStatsGrid
                        items={[
                            { label: "Total", value: stats.total },
                            { label: "Nesta página", value: stats.pageItems },
                        ]}
                    />

                    {error ? <EntityAlert tone="error">{error}</EntityAlert> : null}

                    <div className="mb-6 rounded-4xl border border-orange-100 bg-white/92 p-5 shadow-sm dark:border-orange-500/10 dark:bg-slate-900/88 md:p-6">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Buscar</span>
                            <input
                                type="text"
                                placeholder="Buscar por adotante, animal ou ID"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-shadow duration-150 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-orange-400 dark:focus:ring-orange-400/50"
                            />
                        </label>
                    </div>

                    <AdoptionsList
                        adoptions={paginated}
                        loading={loading}
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        onDelete={setAdoptionToDelete}
                    />
                </EntityPageShell>

                <ConfirmDeleteModal
                    open={!!adoptionToDelete}
                    title="Excluir adoção"
                    description="Confirme a exclusão do registro de adoção."
                    itemLabel={
                        adoptionToDelete
                            ? `${adoptionToDelete.adopterName} / ${adoptionToDelete.animalName}`
                            : undefined
                    }
                    loading={deleting}
                    onClose={() => setAdoptionToDelete(null)}
                    onConfirm={handleDelete}
                />
            </AdminLayout>
        </>
    );
}
