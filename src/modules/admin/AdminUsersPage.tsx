import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, Shield, UserRound, XCircle } from "lucide-react";
import type { UserProfile, UserRole } from "@/modules/auth";
import { approveUser, listUsers, rejectUser } from "@/modules/auth/services/userProfiles";
import { useAuth } from "@/modules/auth/context/useAuth";
import { AdminLayout } from "@/modules/dashboard/AdminLayout";
import { AdminDataTable, Button, EntityAlert, EntityPageHeader, EntityPageShell, EntityStatsGrid, TablePagination, useToast } from "@/shared/components/ui";
import { formatDateTime } from "@/shared/utils/date";

type PendingRoleMap = Record<string, UserRole>;
const ITEMS_PER_PAGE = 5;

function paginateItems<T>(items: T[], page: number) {
    const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const paginatedItems = items.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

    return {
        items: paginatedItems,
        totalPages,
        currentPage: safePage,
        hasNextPage: safePage < totalPages,
    };
}

export function AdminUsersPage() {
    const { profile } = useAuth();
    const { showToast } = useToast();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null);
    const [pendingRoles, setPendingRoles] = useState<PendingRoleMap>({});
    const [processingUserId, setProcessingUserId] = useState<string | null>(null);
    const [pendingPage, setPendingPage] = useState(1);
    const [approvedPage, setApprovedPage] = useState(1);
    const [rejectedPage, setRejectedPage] = useState(1);

    const loadUsers = async () => {
        setLoadingUsers(true);
        try {
            const nextUsers = await listUsers();
            setUsers(nextUsers);
            setPendingRoles((current) => {
                const nextMap = { ...current };
                for (const user of nextUsers) {
                    if (!nextMap[user.id]) {
                        nextMap[user.id] = user.role ?? "standard";
                    }
                }
                return nextMap;
            });
            setPageError(null);
        } catch (error) {
            setPageError(error instanceof Error ? error.message : "Nao foi possivel carregar os usuarios.");
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        void loadUsers();
    }, []);

    const pendingUsers = useMemo(() => users.filter((user) => user.status === "pending"), [users]);
    const approvedUsers = useMemo(() => users.filter((user) => user.status === "approved"), [users]);
    const rejectedUsers = useMemo(() => users.filter((user) => user.status === "rejected"), [users]);
    const pendingPaginated = useMemo(() => paginateItems(pendingUsers, pendingPage), [pendingPage, pendingUsers]);
    const approvedPaginated = useMemo(() => paginateItems(approvedUsers, approvedPage), [approvedPage, approvedUsers]);
    const rejectedPaginated = useMemo(() => paginateItems(rejectedUsers, rejectedPage), [rejectedPage, rejectedUsers]);

    const stats = useMemo(
        () => [
            { label: "Pendentes", value: pendingUsers.length },
            { label: "Aprovados", value: approvedUsers.length },
            { label: "Administradores", value: approvedUsers.filter((user) => user.role === "admin").length },
            { label: "Rejeitados", value: rejectedUsers.length },
        ],
        [approvedUsers, pendingUsers.length, rejectedUsers.length],
    );

    const handleApprove = async (userId: string) => {
        if (!profile) return;

        setProcessingUserId(userId);
        try {
            await approveUser(userId, pendingRoles[userId] ?? "standard", profile);
            showToast("Solicitacao aprovada com sucesso.");
            await loadUsers();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Nao foi possivel aprovar a solicitacao.";
            showToast(message, "error");
        } finally {
            setProcessingUserId(null);
        }
    };

    const handleReject = async (userId: string) => {
        if (!profile) return;

        setProcessingUserId(userId);
        try {
            await rejectUser(userId, profile);
            showToast("Solicitacao rejeitada.");
            await loadUsers();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Nao foi possivel rejeitar a solicitacao.";
            showToast(message, "error");
        } finally {
            setProcessingUserId(null);
        }
    };

    return (
        <>
            <Helmet>
                <title>Bonny | Usuarios</title>
            </Helmet>

            <AdminLayout>
                <EntityPageShell>
                    <EntityPageHeader
                        eyebrow="Administracao"
                        title="Aprovacao de usuarios"
                        description="Funcionarios se cadastram sozinhos e os administradores aprovam ou rejeitam a solicitacao definindo o cargo no momento da liberacao."
                    />

                    <EntityStatsGrid items={stats} />

                    {pageError ? <EntityAlert tone="error">{pageError}</EntityAlert> : null}

                    <div className="space-y-8">
                        <AdminDataTable
                            title="Solicitacoes pendentes de aprovacao"
                            loading={loadingUsers}
                            loadingMessage="Carregando solicitacoes..."
                            emptyTitle="Nenhuma solicitacao pendente"
                            emptyDescription="Novos cadastros aguardando aprovacao aparecerao aqui."
                            isEmpty={pendingUsers.length === 0}
                            minWidthClassName="min-w-[760px]"
                            columnCount={4}
                            footer={
                                <TablePagination
                                    page={pendingPaginated.currentPage}
                                    totalPages={pendingPaginated.totalPages}
                                    hasNextPage={pendingPaginated.hasNextPage}
                                    onPrevious={() => setPendingPage((current) => current - 1)}
                                    onNext={() => setPendingPage((current) => current + 1)}
                                />
                            }
                            head={
                                <tr>
                                    <th className="px-4 py-3 text-left">Usuario</th>
                                    <th className="px-4 py-3 text-left">Solicitado em</th>
                                    <th className="px-4 py-3 text-left">Cargo</th>
                                    <th className="px-4 py-3 text-right">Acoes</th>
                                </tr>
                            }
                        >
                            {pendingPaginated.items.map((user) => {
                                const isProcessing = processingUserId === user.id;

                                return (
                                    <tr key={user.id} className="align-top transition-colors hover:bg-orange-50/50 dark:hover:bg-slate-900/60">
                                        <td className="px-4 py-4">
                                            <div>
                                                <div className="inline-flex items-start gap-3">
                                                    <div className="rounded-2xl bg-orange-50 p-2.5 text-orange-500 dark:bg-orange-500/10 dark:text-orange-300">
                                                        <UserRound className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                                                        <div className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{formatDateTime(user.createdAt)}</td>
                                        <td className="px-4 py-4">
                                            <div className="w-[190px]">
                                                <label className="sr-only" htmlFor={`pending-role-${user.id}`}>
                                                    Cargo na aprovacao
                                                </label>
                                                <div className="relative">
                                                    <Shield className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                    <select
                                                        id={`pending-role-${user.id}`}
                                                        value={pendingRoles[user.id] ?? "standard"}
                                                        onChange={(event) =>
                                                            setPendingRoles((current) => ({
                                                                ...current,
                                                                [user.id]: event.target.value as UserRole,
                                                            }))
                                                        }
                                                        disabled={isProcessing}
                                                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-10 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                                    >
                                                        <option value="standard">Colaborador</option>
                                                        <option value="admin">Administrador</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => void handleApprove(user.id)}
                                                    disabled={isProcessing}
                                                    className="text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300"
                                                    title="Aprovar solicitacao"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    variant="secondary"
                                                    onClick={() => void handleReject(user.id)}
                                                    disabled={isProcessing}
                                                    className="text-red-600 hover:bg-red-50 dark:text-red-300"
                                                    title="Rejeitar solicitacao"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </AdminDataTable>

                        <div className="grid gap-8 lg:grid-cols-2">
                            <AdminDataTable
                                title="Usuarios aprovados"
                                emptyTitle="Nenhum usuario aprovado"
                                emptyDescription="Usuarios liberados para uso do sistema aparecerao aqui."
                                isEmpty={approvedUsers.length === 0}
                                columnCount={3}
                                footer={
                                    <TablePagination
                                        page={approvedPaginated.currentPage}
                                        totalPages={approvedPaginated.totalPages}
                                        hasNextPage={approvedPaginated.hasNextPage}
                                        onPrevious={() => setApprovedPage((current) => current - 1)}
                                        onNext={() => setApprovedPage((current) => current + 1)}
                                    />
                                }
                                head={
                                    <tr>
                                        <th className="px-4 py-3 text-left">Nome</th>
                                        <th className="px-4 py-3 text-left">Cargo</th>
                                        <th className="px-4 py-3 text-left">Aprovado em</th>
                                    </tr>
                                }
                            >
                                {approvedPaginated.items.map((user) => (
                                    <tr key={user.id} className="transition-colors hover:bg-orange-50/50 dark:hover:bg-slate-900/60">
                                        <td className="px-4 py-4">
                                            <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                                        </td>
                                        <td className="px-4 py-4 text-slate-700 dark:text-slate-200">
                                            {user.role === "admin" ? "Administrador" : "Colaborador"}
                                        </td>
                                        <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{formatDateTime(user.approvedAt ?? user.createdAt)}</td>
                                    </tr>
                                ))}
                            </AdminDataTable>

                            <AdminDataTable
                                title="Solicitacoes rejeitadas"
                                emptyTitle="Nenhuma solicitacao rejeitada"
                                emptyDescription="Cadastros recusados aparecerao aqui para auditoria."
                                isEmpty={rejectedUsers.length === 0}
                                columnCount={3}
                                footer={
                                    <TablePagination
                                        page={rejectedPaginated.currentPage}
                                        totalPages={rejectedPaginated.totalPages}
                                        hasNextPage={rejectedPaginated.hasNextPage}
                                        onPrevious={() => setRejectedPage((current) => current - 1)}
                                        onNext={() => setRejectedPage((current) => current + 1)}
                                    />
                                }
                                head={
                                    <tr>
                                        <th className="px-4 py-3 text-left">Nome</th>
                                        <th className="px-4 py-3 text-left">Email</th>
                                        <th className="px-4 py-3 text-left">Atualizado em</th>
                                    </tr>
                                }
                            >
                                {rejectedPaginated.items.map((user) => (
                                    <tr key={user.id} className="transition-colors hover:bg-orange-50/50 dark:hover:bg-slate-900/60">
                                        <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">{user.name}</td>
                                        <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{user.email}</td>
                                        <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{formatDateTime(user.approvedAt ?? user.createdAt)}</td>
                                    </tr>
                                ))}
                            </AdminDataTable>
                        </div>
                    </div>
                </EntityPageShell>
            </AdminLayout>
        </>
    );
}
