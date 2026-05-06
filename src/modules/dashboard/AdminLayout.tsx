import { useEffect, useState, type ReactNode } from "react";
import { LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/context/useAuth";
import {
    SidebarLayout,
    SidebarMenuButton,
    SidebarProvider,
} from "@/shared/components/ui";
import { useTheme } from "@/styles/themes/useTheme";
import { SystemNotificationButton, SystemUpdatesModal } from "./components";
import { dashboardSidebarItems } from "./sidebarItems";
import { sortSystemUpdates, type SystemUpdateEntry } from "./systemUpdates";
import { subscribeSystemUpdates } from "./systemUpdatesService";

interface AdminLayoutProps {
    children: ReactNode;
}

const READ_UPDATES_STORAGE_KEY = "bonny:read-system-patches";

export function AdminLayout({ children }: AdminLayoutProps) {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [updatesModalOpen, setUpdatesModalOpen] = useState(false);
    const [selectedUpdateId, setSelectedUpdateId] = useState<string | null>(null);
    const [updates, setUpdates] = useState<SystemUpdateEntry[]>([]);
    const [readUpdateIds, setReadUpdateIds] = useState<string[]>([]);
    const [loadingNotification, setLoadingNotification] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const storedValue = window.localStorage.getItem(READ_UPDATES_STORAGE_KEY);
        if (!storedValue) return;

        try {
            const parsed = JSON.parse(storedValue);
            setReadUpdateIds(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []);
        } catch {
            setReadUpdateIds([]);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = subscribeSystemUpdates(
            (remoteUpdates) => {
                const sortedUpdates = sortSystemUpdates(remoteUpdates);
                setUpdates(sortedUpdates);
                setSelectedUpdateId((current) => current ?? sortedUpdates[0]?.id ?? null);
                setLoadingNotification(false);
            },
            () => setLoadingNotification(false),
        );

        return unsubscribe;
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const unreadUpdates = updates.filter((update) => !readUpdateIds.includes(update.id));
    const unreadCount = unreadUpdates.length;
    const hasUnreadNotification = unreadCount > 0;
    const latestUpdate = updates[0] ?? null;

    const persistReadUpdates = (nextReadUpdates: string[]) => {
        setReadUpdateIds(nextReadUpdates);

        if (typeof window !== "undefined") {
            window.localStorage.setItem(READ_UPDATES_STORAGE_KEY, JSON.stringify(nextReadUpdates));
        }
    };

    const markUpdateAsRead = (updateId: string) => {
        if (readUpdateIds.includes(updateId)) return;
        persistReadUpdates([...readUpdateIds, updateId]);
    };

    const handleSelectUpdate = (updateId: string) => {
        setSelectedUpdateId(updateId);
        markUpdateAsRead(updateId);
    };

    const handleOpenUpdatesCenter = () => {
        if (latestUpdate) {
            setSelectedUpdateId(latestUpdate.id);
            markUpdateAsRead(latestUpdate.id);
        }

        setUpdatesModalOpen(true);
    };

    const notificationLabel = latestUpdate
        ? `Release ${latestUpdate.version}: ${latestUpdate.title}`
        : "Nenhuma atualizacao monitorada ainda";

    return (
        <SidebarProvider>
            <>
                <SystemNotificationButton
                    hasUnread={hasUnreadNotification}
                    unreadCount={unreadCount}
                    loading={loadingNotification}
                    label={notificationLabel}
                    onClick={handleOpenUpdatesCenter}
                />

                <SidebarLayout
                    brand="Bonny System"
                    brandCompact="BS"
                    sections={dashboardSidebarItems}
                    footer={
                        <div className="space-y-2">
                            <SystemNotificationButton
                                hasUnread={hasUnreadNotification}
                                unreadCount={unreadCount}
                                loading={loadingNotification}
                                label={notificationLabel}
                                onClick={handleOpenUpdatesCenter}
                                mode="sidebar"
                            />
                            <SidebarMenuButton
                                icon={theme === "light" ? Moon : Sun}
                                label={theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"}
                                onClick={toggleTheme}
                                showTooltipWhenCollapsed={false}
                                iconOnlyWhenCollapsed
                            />
                            <SidebarMenuButton
                                icon={LogOut}
                                label="Sair do sistema"
                                destructive
                                onClick={handleLogout}
                                showTooltipWhenCollapsed={false}
                                iconOnlyWhenCollapsed
                            />
                        </div>
                    }
                >
                    {children}
                </SidebarLayout>

                <SystemUpdatesModal
                    open={updatesModalOpen}
                    updates={updates}
                    selectedUpdateId={selectedUpdateId}
                    readUpdateIds={readUpdateIds}
                    onSelectUpdate={handleSelectUpdate}
                    onClose={() => setUpdatesModalOpen(false)}
                />
            </>
        </SidebarProvider>
    );
}
