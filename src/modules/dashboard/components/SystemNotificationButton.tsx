import { Bell, CheckCheck } from "lucide-react";
import { SidebarMenuButton } from "@/shared/components/ui";

interface SystemNotificationButtonProps {
    hasUnread: boolean;
    unreadCount?: number;
    loading?: boolean;
    label: string;
    onClick: () => void;
}

export function SystemNotificationButton({
    hasUnread,
    unreadCount = 0,
    loading = false,
    label,
    onClick,
}: SystemNotificationButtonProps) {
    const Icon = hasUnread ? Bell : CheckCheck;
    const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

    if (loading) {
        return (
            <div className="space-y-2">
                <div className="h-[50px] animate-pulse rounded-2xl border border-slate-200/70 bg-slate-100/90 dark:border-slate-700/60 dark:bg-slate-800/70" />
                <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <SidebarMenuButton
                icon={Icon}
                label={hasUnread ? `${badgeLabel} atualizacao${unreadCount > 1 ? "es" : ""} nova${unreadCount > 1 ? "s" : ""}` : "Sem novidades"}
                onClick={onClick}
                showTooltipWhenCollapsed={false}
            />
            <p className="px-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {label}
            </p>
        </div>
    );
}
