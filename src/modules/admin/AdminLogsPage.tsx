import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Filter, Search } from "lucide-react";
import Select from "react-select";
import type { UserProfile } from "@/modules/auth";
import { listUsers } from "@/modules/auth/services/userProfiles";
import { AdminLayout } from "@/modules/dashboard/AdminLayout";
import { getSystemLogActionLabel, getSystemLogModuleLabel, listSystemLogs } from "@/modules/logs/service";
import type { SystemLogAction, SystemLogModule, SystemLogRecord } from "@/modules/logs/types";
import { AdminDataTable, EntityAlert, EntityPageHeader, EntityPageShell, EntitySectionCard, EntityStatsGrid, TablePagination } from "@/shared/components/ui";
import { formatDateTime } from "@/shared/utils/date";
import { createSelectStyles } from "@/shared/utils/selectStyles";
import { useTheme } from "@/styles/themes/useTheme";

const ITEMS_PER_PAGE = 10;

function paginateItems<T>(items: T[], page: number) {
    const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
    const currentPage = Math.min(page, totalPages);
    const paginatedItems = items.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return {
        items: paginatedItems,
        currentPage,
        totalPages,
        hasNextPage: currentPage < totalPages,
    };
}

export function AdminLogsPage() {
    const { theme } = useTheme();
    const [logs, setLogs] = useState<SystemLogRecord[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState("all");
    const [moduleFilter, setModuleFilter] = useState<SystemLogModule | "all">("all");
    const [actionFilter, setActionFilter] = useState<SystemLogAction | "all">("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        void listUsers().then(setUsers).catch(() => undefined);
    }, []);

    useEffect(() => {
        setLoading(true);
        setError(null);

        void listSystemLogs({
            userId,
            module: moduleFilter,
            action: actionFilter,
        })
            .then((nextLogs) => {
                setLogs(nextLogs);
                setLoading(false);
            })
            .catch((nextError) => {
                setError(nextError instanceof Error ? nextError.message : "Nao foi possivel carregar os logs.");
                setLoading(false);
            });
    }, [actionFilter, moduleFilter, userId]);

    const filteredLogs = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        if (!normalizedSearch) return logs;

        return logs.filter((log) =>
            [log.userName, log.userEmail, log.description, log.targetId]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(normalizedSearch)),
        );
    }, [logs, search]);
    const paginatedLogs = useMemo(() => paginateItems(filteredLogs, page), [filteredLogs, page]);

    const stats = useMemo(
        () => [
            { label: "Total", value: filteredLogs.length },
            { label: "Animais", value: filteredLogs.filter((log) => log.module === "animals").length },
            { label: "Adotantes", value: filteredLogs.filter((log) => log.module === "adopters").length },
            { label: "Adocoes", value: filteredLogs.filter((log) => log.module === "adoptions").length },
        ],
        [filteredLogs],
    );

    const userOptions = useMemo(
        () => [
            { value: "all", label: "Todos" },
            ...users.map((user) => ({
                value: user.id,
                label: user.name,
            })),
        ],
        [users],
    );

    const moduleOptions = useMemo(
        () => [
            { value: "all", label: "Todos" },
            { value: "animals", label: "Animais" },
            { value: "adopters", label: "Adotantes" },
            { value: "adoptions", label: "Adocoes" },
            { value: "users", label: "Usuarios" },
        ],
        [],
    );

    const actionOptions = useMemo(
        () => [
            { value: "all", label: "Todas" },
            { value: "create", label: "Criacao" },
            { value: "update", label: "Edicao" },
            { value: "delete", label: "Exclusao" },
        ],
        [],
    );

    useEffect(() => {
        setPage(1);
    }, [actionFilter, moduleFilter, search, userId]);

    return (
        <>
            <Helmet>
                <title>Bonny | Logs do sistema</title>
            </Helmet>

            <AdminLayout>
                <EntityPageShell>
                    <EntityPageHeader
                        eyebrow="Administracao"
                        title="Logs do sistema"
                        description="Auditoria das acoes executadas no Bonny, com filtros por usuario, modulo e tipo de operacao."
                    />

                    <EntityStatsGrid items={stats} />

                    {error ? <EntityAlert tone="error">{error}</EntityAlert> : null}

                    <EntitySectionCard className="space-y-5">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-orange-500" />
                            <h2 className="text-lg font-semibold text-gray-950 dark:text-white">Filtros</h2>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-4">
                            <label className="flex flex-col gap-2 text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Usuario</span>
                                <Select
                                    value={userOptions.find((option) => option.value === userId) ?? null}
                                    onChange={(option) => setUserId(option?.value ?? "all")}
                                    options={userOptions}
                                    isSearchable={false}
                                    className="min-w-0 w-full"
                                    menuPlacement="auto"
                                    menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                                    styles={createSelectStyles("md", theme === "dark")}
                                />
                            </label>

                            <label className="flex flex-col gap-2 text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Modulo</span>
                                <Select
                                    value={moduleOptions.find((option) => option.value === moduleFilter) ?? null}
                                    onChange={(option) => setModuleFilter((option?.value ?? "all") as SystemLogModule | "all")}
                                    options={moduleOptions}
                                    isSearchable={false}
                                    className="min-w-0 w-full"
                                    menuPlacement="auto"
                                    menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                                    styles={createSelectStyles("md", theme === "dark")}
                                />
                            </label>

                            <label className="flex flex-col gap-2 text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Acao</span>
                                <Select
                                    value={actionOptions.find((option) => option.value === actionFilter) ?? null}
                                    onChange={(option) => setActionFilter((option?.value ?? "all") as SystemLogAction | "all")}
                                    options={actionOptions}
                                    isSearchable={false}
                                    className="min-w-0 w-full"
                                    menuPlacement="auto"
                                    menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                                    styles={createSelectStyles("md", theme === "dark")}
                                />
                            </label>

                            <label className="flex flex-col gap-2 text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Busca rapida</span>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Usuario, email, descricao..."
                                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-4 pl-10 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                    />
                                </div>
                            </label>
                        </div>
                    </EntitySectionCard>

                    <div className="mt-6">
                        <AdminDataTable
                            title="Historico de auditoria"
                            loading={loading}
                            loadingMessage="Carregando logs..."
                            emptyTitle="Nenhum log encontrado"
                            emptyDescription="Ajuste os filtros para localizar os registros desejados."
                            isEmpty={filteredLogs.length === 0}
                            minWidthClassName="min-w-[820px]"
                            columnCount={5}
                            footer={
                                <TablePagination
                                    page={paginatedLogs.currentPage}
                                    totalPages={paginatedLogs.totalPages}
                                    hasNextPage={paginatedLogs.hasNextPage}
                                    onPrevious={() => setPage((current) => current - 1)}
                                    onNext={() => setPage((current) => current + 1)}
                                />
                            }
                            head={
                                <tr>
                                    <th className="px-4 py-3 text-left">Usuario</th>
                                    <th className="px-4 py-3 text-left">Acao</th>
                                    <th className="px-4 py-3 text-left">Modulo</th>
                                    <th className="px-4 py-3 text-left">Descricao</th>
                                    <th className="px-4 py-3 text-left">Data</th>
                                </tr>
                            }
                        >
                            {paginatedLogs.items.map((log) => (
                                <tr key={log.id} className="align-top transition-colors hover:bg-orange-50/50 dark:hover:bg-slate-900/60">
                                    <td className="px-4 py-4 text-slate-700 dark:text-slate-200">
                                        <div className="font-medium text-slate-900 dark:text-white">{log.userName}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">{log.userEmail}</div>
                                    </td>
                                    <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{getSystemLogActionLabel(log.action)}</td>
                                    <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{getSystemLogModuleLabel(log.module)}</td>
                                    <td className="px-4 py-4 text-slate-700 dark:text-slate-200">
                                        <div>{log.description}</div>
                                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Registro: {log.targetId}</div>
                                    </td>
                                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{formatDateTime(log.createdAt)}</td>
                                </tr>
                            ))}
                        </AdminDataTable>
                    </div>
                </EntityPageShell>
            </AdminLayout>
        </>
    );
}
