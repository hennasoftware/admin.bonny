import { Search } from "lucide-react";
import { FormField } from "@/shared/components/ui";
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
                    <select
                        value={status}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 outline-none transition-shadow duration-150 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-orange-400 dark:focus:ring-orange-400/50"
                    >
                        <option value="Todos">Todos os status</option>
                        {ADOPTER_STATUSES.map((statusOption) => (
                            <option key={statusOption.value} value={statusOption.value}>
                                {statusOption.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
        </div>
    );
}
