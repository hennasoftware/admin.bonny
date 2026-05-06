import { Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { formatDateTime } from "@/shared/utils/date";
import type { AdoptionRecord, AdoptionStatus } from "@/modules/adoptions/services/service";
import Select from "react-select";
import { createSelectStyles } from "@/shared/utils/selectStyles";
import { useTheme } from "@/styles/themes/useTheme";

interface AdoptionsListProps {
    adoptions: AdoptionRecord[];
    loading?: boolean;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    onPageChange: (page: number) => void;
    onViewAdopter: (adopterId: string) => void;
    onViewAnimal: (animalId: string) => void;
    onDelete: (item: AdoptionRecord) => void;
    onStatusChange: (item: AdoptionRecord, status: AdoptionStatus) => void;
}

const statusStyles: Record<AdoptionStatus, string> = {
    "Em analise": "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    Agendada: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
    Concluida: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
};

export function AdoptionsList({
    adoptions,
    loading = false,
    page,
    totalPages,
    hasNextPage,
    onPageChange,
    onViewAdopter,
    onViewAnimal,
    onDelete,
    onStatusChange,
}: AdoptionsListProps) {
    const { theme } = useTheme();
    const canPrev = page > 1;
    const canNext = hasNextPage;

    const statusOptions = ["Em analise", "Agendada", "Concluida"].map((value) => ({ value, label: value }));

    return (
        <section className="overflow-hidden rounded-[28px] border border-orange-100/70 bg-white/82 shadow-[0_18px_50px_-34px_rgb(15_23_42/0.28)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-950/60">
            <div className="border-b border-slate-200/70 px-5 py-4 dark:border-slate-800 sm:px-6">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Pagina {page} de {totalPages}
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-slate-200/70 bg-slate-50/80 text-xs uppercase tracking-[0.12em] text-slate-500 dark:border-slate-800 dark:bg-slate-900/80">
                        <tr>
                            <th className="px-4 py-3 text-left">Adotante</th>
                            <th className="px-4 py-3 text-left">Animal</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Observacoes</th>
                            <th className="px-4 py-3 text-left">Atualizacao</th>
                            <th className="px-4 py-3 text-right">Acoes</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                    Carregando adocoes...
                                </td>
                            </tr>
                        ) : adoptions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-10 text-center">
                                    <p className="text-base font-medium text-slate-900 dark:text-slate-100">Nenhuma adocao encontrada</p>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Ajuste os filtros ou registre uma nova adocao.</p>
                                </td>
                            </tr>
                        ) : (
                            adoptions.map((item) => (
                                <tr key={item.id} className="transition-colors hover:bg-orange-50/50 dark:hover:bg-slate-900/60">
                                    <td className="px-4 py-4">
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => onViewAdopter(item.adopterId)}
                                                className="cursor-pointer text-left font-medium text-slate-900 transition-colors hover:text-orange-600 dark:text-white dark:hover:text-orange-300"
                                                title="Ver detalhes do adotante"
                                            >
                                                {item.adopterName}
                                            </button>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">ID: {item.adopterId}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => onViewAnimal(item.animalId)}
                                                className="cursor-pointer text-left font-medium text-slate-900 transition-colors hover:text-orange-600 dark:text-white dark:hover:text-orange-300"
                                                title="Ver detalhes do animal"
                                            >
                                                {item.animalName}
                                            </button>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">ID: {item.animalId}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col gap-2">
                                            <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[item.status]}`}>
                                                {item.status}
                                            </span>
                                            <Select
                                                value={statusOptions.find((option) => option.value === item.status) ?? null}
                                                onChange={(opt) => onStatusChange(item, (opt as any)?.value ?? item.status)}
                                                options={statusOptions}
                                                isSearchable={false}
                                                className="w-40"
                                                menuPlacement="auto"
                                                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                                                menuPosition="fixed"
                                                styles={createSelectStyles("sm", theme === "dark")}
                                                classNames={{
                                                    control: () =>
                                                        "rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs text-gray-900 outline-none transition-shadow duration-150 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
                                                    valueContainer: () => "px-2",
                                                    singleValue: () => "text-xs",
                                                    menu: () => "mt-1 rounded-lg border border-gray-200 bg-white shadow-lg z-50 dark:border-gray-700 dark:bg-gray-800",
                                                    option: (state) => `px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ${state.isFocused ? "bg-slate-50 dark:bg-slate-900/60" : ""}`,
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td className="max-w-xs px-4 py-4 text-slate-600 dark:text-slate-300">
                                        <div className="truncate">{item.notes || "-"}</div>
                                    </td>
                                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                                        {formatDateTime(item.updatedAt ?? item.createdAt)}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="secondary"
                                                onClick={() => onDelete(item)}
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

            <div className="flex items-center justify-center gap-2 border-t border-slate-200/70 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/40">
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
