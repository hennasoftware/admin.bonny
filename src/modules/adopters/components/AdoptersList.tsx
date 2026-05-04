import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { AdopterStatusBadge } from "./AdopterStatusBadge";
import { formatAddress, formatCPF, formatDateTime, formatPhone } from "../utils/formatter";
import type { AdopterRecord } from "../types";

interface AdoptersListProps {
    adopters: AdopterRecord[];
    loading?: boolean;
    onEdit: (adopter: AdopterRecord) => void;
    onDelete: (adopter: AdopterRecord) => void;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    onPageChange: (page: number) => void;
}

export function AdoptersList({
    adopters,
    loading = false,
    onEdit,
    onDelete,
    page,
    totalPages,
    hasNextPage,
    onPageChange,
}: AdoptersListProps) {
    const canPrev = page > 1;
    const canNext = hasNextPage;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Pagina {page} de {totalPages}
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                        <tr>
                            <th className="px-4 py-3 text-left">Nome</th>
                            <th className="px-4 py-3 text-left">Contato</th>
                            <th className="px-4 py-3 text-left">Endereco</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Atualizacao</th>
                            <th className="px-4 py-3 text-right">Acoes</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="p-6 text-center text-slate-500">
                                    Carregando adotantes...
                                </td>
                            </tr>
                        ) : adopters.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-10 text-center">
                                    <p className="text-base font-medium text-slate-900 dark:text-slate-100">Nenhum adotante encontrado</p>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Ajuste os filtros ou cadastre um novo adotante.</p>
                                </td>
                            </tr>
                        ) : (
                            adopters.map((adopter) => (
                                <tr key={adopter.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{adopter.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">CPF: {formatCPF(adopter.cpf)}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        <div>
                                            <p>{adopter.email}</p>
                                            <p className="text-xs">{formatPhone(adopter.phone)}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        <div className="max-w-xs truncate">{formatAddress(adopter)}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <AdopterStatusBadge status={adopter.status} />
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                        {formatDateTime(adopter.updatedAt ?? adopter.createdAt)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="secondary" onClick={() => onEdit(adopter)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => onDelete(adopter)}
                                                className="text-red-600 hover:bg-red-50 dark:text-red-300"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-center gap-2 border-t border-slate-200 p-4 dark:border-slate-800">
                <Button variant="secondary" disabled={!canPrev} onClick={() => onPageChange(page - 1)}>
                    Anterior
                </Button>
                <Button variant="secondary" disabled={!canNext} onClick={() => onPageChange(page + 1)}>
                    Proxima
                </Button>
            </div>
        </section>
    );
}
