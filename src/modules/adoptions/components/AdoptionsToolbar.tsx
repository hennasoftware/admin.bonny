import { Search } from "lucide-react";
import { FormField } from "@/shared/components/ui";
import type { AdoptionStatus } from "../services/service";

interface AdoptionsToolbarProps {
    search: string;
    status: AdoptionStatus | "Todos";
    onSearchChange: (search: string) => void;
    onStatusChange: (status: AdoptionStatus | "Todos") => void;
}

export function AdoptionsToolbar({ search, status, onSearchChange, onStatusChange }: AdoptionsToolbarProps) {
    return (
        <div className="rounded-4xl border border-orange-100 bg-white/92 p-5 shadow-sm dark:border-orange-500/10 dark:bg-slate-900/88 md:p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
                <FormField
                    label="Buscar"
                    placeholder="Adotante, animal ou ID"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    icon={Search}
                />

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por status</span>
                    <select
                        value={status}
                        onChange={(event) => onStatusChange(event.target.value as AdoptionStatus | "Todos")}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 outline-none transition-shadow duration-150 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-orange-400 dark:focus:ring-orange-400/50"
                    >
                        <option value="Todos">Todos</option>
                        <option value="Em analise">Em analise</option>
                        <option value="Agendada">Agendada</option>
                        <option value="Concluida">Concluida</option>
                    </select>
                </label>
            </div>
        </div>
    );
}
