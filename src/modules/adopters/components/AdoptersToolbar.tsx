import { Search } from "lucide-react";
import { FormField } from "@/shared/components/ui";
import Select from "react-select";
import { createSelectStyles } from "@/shared/utils/selectStyles";
import { useTheme } from "@/styles/themes/useTheme";
import { ADOPTER_STATUSES } from "../constants";

interface AdoptersToolbarProps {
    search: string;
    status: string;
    onSearchChange: (search: string) => void;
    onStatusChange: (status: string) => void;
}

export function AdoptersToolbar({
    search,
    status,
    onSearchChange,
    onStatusChange,
}: AdoptersToolbarProps) {
    const { theme } = useTheme();
    return (
        <div className="rounded-4xl border border-orange-100 bg-white/92 p-5 shadow-sm dark:border-orange-500/10 dark:bg-slate-900/88 md:p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
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
                            .sort((a, b) => a.label.localeCompare(b.label))
                            .find((o) => o.value === status) ?? null
                        }
                        onChange={(opt) => onStatusChange((opt as any)?.value ?? "Todos")}
                        options={[{ value: "Todos", label: "Todos os status" }, ...ADOPTER_STATUSES.map((s) => ({ value: s.value, label: s.label }))]
                            .sort((a, b) => a.label.localeCompare(b.label))
                        }
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
