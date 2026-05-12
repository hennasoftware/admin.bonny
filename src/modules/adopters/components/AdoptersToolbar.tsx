import { Search } from "lucide-react";
import Select from "react-select";
import { FormField } from "@/shared/components/ui";
import { createSelectStyles } from "@/shared/utils/selectStyles";
import type { SortDirection } from "@/shared/utils/sortByRecent";
import { useTheme } from "@/styles/themes/useTheme";
import { ADOPTER_STATUSES } from "../constants";

interface AdoptersToolbarProps {
    search: string;
    status: string;
    sortDirection: SortDirection;
    onSearchChange: (search: string) => void;
    onStatusChange: (status: string) => void;
    onSortDirectionChange: (value: SortDirection) => void;
}

export function AdoptersToolbar({ search, status, sortDirection, onSearchChange, onStatusChange, onSortDirectionChange }: AdoptersToolbarProps) {
    const { theme } = useTheme();

    return (
        <div className="rounded-[28px] border border-orange-100/70 bg-white/82 p-5 shadow-[0_18px_50px_-34px_rgb(15_23_42/0.28)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-950/60 md:p-6">
            <div className="mb-4 border-b border-slate-200/70 pb-4 dark:border-slate-800">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Filtros</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Refine a lista por nome, documento, status ou ordem de exibicao.</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_260px_260px]">
                <FormField
                    label="Buscar"
                    placeholder="Nome, email, telefone ou CPF"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    icon={Search}
                />

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por status</span>
                    <Select
                        value={[{ value: "Todos", label: "Todos os status" }, ...ADOPTER_STATUSES.map((s) => ({ value: s.value, label: s.label }))]
                            .find((o) => o.value === status) ?? null}
                        onChange={(opt) => onStatusChange((opt as any)?.value ?? "Todos")}
                        options={[{ value: "Todos", label: "Todos os status" }, ...ADOPTER_STATUSES.map((s) => ({ value: s.value, label: s.label }))]
                            .sort((a, b) => a.label.localeCompare(b.label))}
                        isSearchable={false}
                        className="w-full"
                        menuPlacement="auto"
                        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                        styles={createSelectStyles("md", theme === "dark")}
                    />
                </label>

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ordenar por data</span>
                    <Select
                        value={[
                            { value: "desc" as SortDirection, label: "Mais recentes primeiro" },
                            { value: "asc" as SortDirection, label: "Mais antigos primeiro" },
                        ].find((option) => option.value === sortDirection) ?? null}
                        onChange={(opt) => onSortDirectionChange((opt as any)?.value ?? "desc")}
                        options={[
                            { value: "desc" as SortDirection, label: "Mais recentes primeiro" },
                            { value: "asc" as SortDirection, label: "Mais antigos primeiro" },
                        ]}
                        isSearchable={false}
                        className="w-full"
                        menuPlacement="auto"
                        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                        styles={createSelectStyles("md", theme === "dark")}
                    />
                </label>
            </div>
        </div>
    );
}
