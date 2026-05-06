import { Bell, CheckCheck } from "lucide-react";
import { Button, SidebarMenuButton } from "@/shared/components/ui";

interface SystemNotificationButtonProps {
    hasUnread: boolean;
    unreadCount?: number;
    loading?: boolean;
    label: string;
    onClick: () => void;
    mode?: "floating" | "sidebar";
}

export function SystemNotificationButton({
    hasUnread,
    unreadCount = 0,
    loading = false,
    label,
    onClick,
    mode = "floating",
}: SystemNotificationButtonProps) {
    const Icon = hasUnread ? Bell : CheckCheck;
    const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

    if (mode === "sidebar") {
        if (loading) {
            return (
                <div className="space-y-2 md:hidden">
                    <div className="h-[50px] animate-pulse rounded-2xl border border-slate-200/70 bg-slate-100/90 dark:border-slate-700/60 dark:bg-slate-800/70" />
                    <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
                </div>
            );
        }

        return (
            <div className="space-y-2 md:hidden">
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

    if (loading) {
        return (
            <div className="fixed right-6 top-5 z-30 hidden md:block">
                <div className="h-14 w-14 animate-pulse rounded-full border border-slate-200/70 bg-slate-100/90 shadow-[0_18px_40px_-22px_rgb(15_23_42/0.25)] dark:border-slate-700/60 dark:bg-slate-800/80" />
            </div>
        );
    }

    return (
        <div className="fixed right-6 top-5 z-30 hidden md:block">
            <Button
                type="button"
                variant={hasUnread ? "primary" : "secondary"}
                onClick={onClick}
                title={label}
                className="relative h-14 w-14 rounded-full p-0 shadow-[0_18px_40px_-22px_rgb(15_23_42/0.45)]"
                aria-live="polite"
                aria-label={label}
            >
                <Icon className="h-5 w-5" />
                {hasUnread && unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                        {badgeLabel}
                    </span>
                ) : null}
            </Button>
        </div>
    );
}
