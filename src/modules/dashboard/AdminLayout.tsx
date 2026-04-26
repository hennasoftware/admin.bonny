import type { ReactNode } from "react";
import { LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/context/useAuth";
import {
    SidebarLayout,
    SidebarMenuButton,
    SidebarProvider,
} from "@/shared/components/ui";
import { useTheme } from "@/styles/themes/useTheme";
import { dashboardSidebarItems } from "./sidebarItems";

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <SidebarProvider>
            <SidebarLayout
                brand="Bonny System"
                brandCompact="BS"
                sections={dashboardSidebarItems}
                footer={
                    <div className="space-y-2">
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
        </SidebarProvider>
    );
}
