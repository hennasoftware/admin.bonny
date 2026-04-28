import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/modules/dashboard/AdminLayout";
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
    const [saving, setSaving] = useState(false);

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

    const handleDelete = async (adopter: AdopterRecord) => {
        if (!window.confirm(`Excluir ${adopter.name}?`)) return;

        try {
            await removeAdopter(adopter.id);
        } catch {
            setError("Não foi possível excluir o adotante.");
        }
    };

    const handleUpdate = async (adopterId: string, values: AdopterFormState) => {
        setSaving(true);

        try {
            await updateAdopter(adopterId, values);
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
                <title>Bonny | Adotantes cadastrados</title>
            </Helmet>

            <AdminLayout>
                <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-100 px-4 py-20 md:px-8 md:py-10 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
                    <div className="mx-auto w-full max-w-7xl">
                        <div className="mb-6 flex items-center flex-col md:flex-row md:justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
                                    Adotantes
                                </p>
                                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 dark:text-white">
                                    Adotantes cadastrados
                                </h1>
                                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                    Busque, filtre, edite ou remova registros do Firestore.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/adotantes/cadastro")}
                                className="rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 shadow-sm transition-colors hover:bg-orange-50 dark:border-gray-700 dark:bg-slate-900 dark:text-orange-300 dark:hover:bg-slate-800"
                            >
                                Novo cadastro
                            </button>
                        </div>

                        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {[
                                { label: "Total", value: stats.total },
                                { label: "Ativos", value: stats.active },
                                { label: "Inativos", value: stats.inactive },
                                { label: "Bloqueados", value: stats.blocked },
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
                            onDelete={handleDelete}
                        />
                    </div>
                </main>

                <AdopterEditorModal
                    adopter={editingAdopter}
                    loading={saving}
                    onClose={() => setEditingAdopter(null)}
                    onSubmit={handleUpdate}
                />
            </AdminLayout>
        </>
    );
}
