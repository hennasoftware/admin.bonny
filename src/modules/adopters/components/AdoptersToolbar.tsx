import { Search } from "lucide-react";
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Buscar por nome, email, telefone ou CPF..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
            </div>

            <select
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
                <option value="Todos">Todos os status</option>
                {ADOPTER_STATUSES.map((statusOption) => (
                    <option key={statusOption.value} value={statusOption.value}>
                        {statusOption.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
