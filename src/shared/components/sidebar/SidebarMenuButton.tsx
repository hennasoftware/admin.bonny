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
    collapsed = false,
    className = "",
    destructive = false,
    showTooltipWhenCollapsed = true,
    iconOnlyWhenCollapsed = false,
    ...props
}: SidebarMenuButtonProps) {
    const { collapsed: sidebarCollapsed } = useSidebar();
    const isCollapsed = collapsed ?? sidebarCollapsed;
    const shouldRenderLabel = !isCollapsed || !iconOnlyWhenCollapsed;

    return (
        <button
            type="button"
            title={isCollapsed && showTooltipWhenCollapsed ? label : undefined}
            className={[
                "flex w-full min-w-0 overflow-hidden items-center gap-5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                "border border-transparent text-gray-600 hover:bg-orange-50 hover:text-gray-950",
                "dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white",
                isCollapsed ? "justify-start md:justify-center md:gap-0 md:px-2.5" : "justify-start",
                destructive
                    ? "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                    : "",
                className,
            ].join(" ")}
            {...props}
        >
            <Icon className="h-5 w-5 shrink-0" />
            {shouldRenderLabel && <span className="min-w-0 truncate whitespace-nowrap">{label}</span>}
        </button>
    );
}
