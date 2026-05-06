import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { useSidebar } from "./useSidebar";

interface SidebarMenuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: LucideIcon;
    label: string;
    collapsed?: boolean;
    destructive?: boolean;
    showTooltipWhenCollapsed?: boolean;
    iconOnlyWhenCollapsed?: boolean;
}

export function SidebarMenuButton({
    icon: Icon,
    label,
    collapsed,
    className = "",
    destructive = false,
    showTooltipWhenCollapsed = true,
    iconOnlyWhenCollapsed = false,
    ...props
}: SidebarMenuButtonProps) {
    const { collapsed: sidebarCollapsed } = useSidebar();
    const isCollapsed = collapsed ?? sidebarCollapsed;
    const labelClassName = isCollapsed ? "min-w-0 truncate md:hidden" : "min-w-0 truncate";

    return (
        <button
            type="button"
            title={isCollapsed && showTooltipWhenCollapsed ? label : undefined}
            className={[
                "flex w-full min-w-0 items-center gap-4 overflow-hidden rounded-2xl border px-3 py-3 text-sm font-medium transition-all duration-200",
                "border-slate-200/70 bg-white/70 text-gray-600 hover:border-orange-200 hover:bg-orange-50 hover:text-gray-950",
                "dark:border-slate-700/60 dark:bg-slate-900/50 dark:text-gray-300 dark:hover:border-orange-500/20 dark:hover:bg-slate-800 dark:hover:text-white",
                isCollapsed ? "justify-start md:justify-center md:gap-0 md:px-2.5" : "justify-start",
                destructive
                    ? "hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-500/20 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                    : "",
                className,
            ].join(" ")}
            {...props}
        >
            <Icon className="h-5 w-5 shrink-0" />
            <span className={labelClassName}>{label}</span>
        </button>
    );
}
