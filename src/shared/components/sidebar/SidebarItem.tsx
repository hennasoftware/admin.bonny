import { NavLink } from "react-router-dom";
import type { SidebarEntry } from "./types";

interface SidebarItemProps extends SidebarEntry {
    collapsed?: boolean;
    onNavigate?: () => void;
}

export function SidebarItem({ label, path, icon: Icon, collapsed = false, onNavigate }: SidebarItemProps) {
    return (
        <NavLink
            to={path}
            end
            title={collapsed ? label : undefined}
            onClick={onNavigate}
            className={({ isActive }) =>
                [
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                    collapsed ? "justify-start md:justify-center md:px-2.5" : "justify-start",
                    isActive
                        ? "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300"
                        : "border-transparent text-gray-600 hover:bg-orange-50 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white",
                ].join(" ")
            }
        >
            <Icon className="h-5 w-5 shrink-0" />
            <span className={collapsed ? "truncate md:hidden" : "truncate"}>{label}</span>
        </NavLink>
    );
}
