import { Search } from "lucide-react";
import { FormField } from "@/shared/components/ui";
import type { AnimalStatus } from "../types";

interface AnimalsToolbarProps {
    search: string;
    status: AnimalStatus | "Todos";
    onSearchChange: (value: string) => void;
    onStatusChange: (value: AnimalStatus | "Todos") => void;
}

export function AnimalsToolbar({
    search,
    status,
    onSearchChange,
    onStatusChange,
}: AnimalsToolbarProps) {
    return (
        <div className="rounded-[2rem] border border-orange-100 bg-white/92 p-5 shadow-sm dark:border-orange-500/10 dark:bg-slate-900/88 md:p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
                <FormField
                    label="Buscar"
                    placeholder="Nome, raça, espécie, cor ou status"
                    icon={Search}
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                />

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por status</span>
                    <select
                        value={status}
                        onChange={(event) => onStatusChange(event.target.value as AnimalStatus | "Todos")}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 outline-none transition-[box-shadow] duration-150 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-orange-400 dark:focus:ring-orange-400/50"
                    >
                        <option>Todos</option>
                        <option>Disponível</option>
                        <option>Em processo</option>
                        <option>Adotado</option>
                    </select>
                </label>
            </div>
        </div>
    );
}
