import { Search } from "lucide-react";
import Select from "react-select";
import { FormField } from "@/shared/components/ui";
import { createSelectStyles } from "@/shared/utils/selectStyles";
import { useTheme } from "@/styles/themes/useTheme";
import type { AnimalStatus } from "../types/types";

interface AnimalsToolbarProps {
    search: string;
    status: AnimalStatus | "Todos";
    onSearchChange: (value: string) => void;
    onStatusChange: (value: AnimalStatus | "Todos") => void;
}

export function AnimalsToolbar({ search, status, onSearchChange, onStatusChange }: AnimalsToolbarProps) {
    const { theme } = useTheme();

    return (
        <div className="rounded-[28px] border border-orange-100/70 bg-white/82 p-5 shadow-[0_18px_50px_-34px_rgb(15_23_42/0.28)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-950/60 md:p-6">
            <div className="mb-4 border-b border-slate-200/70 pb-4 dark:border-slate-800">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Filtros</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Refine a lista por codigo, nome, especie ou status.</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
                <FormField
                    label="Buscar"
                    placeholder="Codigo, nome, raca, especie, cor ou status"
                    icon={Search}
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                />

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por status</span>
                    <Select
                        value={["Adotado", "Disponivel", "Em processo", "Todos"]
                            .map((v) => ({ value: v as AnimalStatus | "Todos", label: v }))
                            .find((o) => o.value === status) ?? null}
                        onChange={(opt) => onStatusChange((opt as any)?.value ?? "Todos")}
                        options={["Adotado", "Disponivel", "Em processo", "Todos"]
                            .map((v) => ({ value: v as AnimalStatus | "Todos", label: v }))
                            .sort((a, b) => a.label.localeCompare(b.label))}
                        isSearchable={false}
                        className="w-full"
                        menuPlacement="auto"
                        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                        styles={createSelectStyles("md", theme === "dark")}
                        classNames={{
                            control: () =>
                                "rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-shadow duration-150 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
                            valueContainer: () => "px-3",
                            singleValue: () => "text-sm",
                            placeholder: () => "text-gray-400",
                            menu: () => "mt-1 rounded-lg border border-gray-200 bg-white shadow-lg z-50 dark:border-gray-700 dark:bg-gray-800",
                            option: (state) =>
                                `px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ${state.isFocused ? "bg-slate-50 dark:bg-slate-900/60" : ""}`,
                        }}
                    />
                </label>
            </div>
        </div>
    );
}
