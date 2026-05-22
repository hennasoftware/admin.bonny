import { BarChart3, Bell, Dog, FileClock, List, PlusCircle, Shield, Users } from "lucide-react";
import type { UserRole } from "@/modules/auth";
import type { SidebarSection } from "@/shared/components/sidebar";

export function getDashboardSidebarItems(role: UserRole | null): SidebarSection[] {
    const sections: SidebarSection[] = [
        {
            section: "Geral",
            items: [
                {
                    label: "Dashboard",
                    path: "/dashboard",
                    icon: BarChart3,
                },
                {
                    label: "Atualizacoes",
                    path: "/atualizacoes",
                    icon: Bell,
                },
            ],
        },
        {
            section: "Animais",
            items: [
                {
                    label: "Cadastrar",
                    path: "/animais/cadastro",
                    icon: Dog,
                },
                {
                    label: "Visualizar",
                    path: "/animais/lista",
                    icon: List,
                },
            ],
        },
        {
            section: "Adotantes",
            items: [
                {
                    label: "Cadastrar",
                    path: "/adotantes/cadastro",
                    icon: Users,
                },
                {
                    label: "Visualizar",
                    path: "/adotantes/lista",
                    icon: List,
                },
            ],
        },
        {
            section: "Adocoes",
            items: [
                {
                    label: "Cadastrar",
                    path: "/adocoes/cadastro",
                    icon: PlusCircle,
                },
                {
                    label: "Visualizar",
                    path: "/adocoes/lista",
                    icon: List,
                },
            ],
        },
    ];

    if (role === "admin") {
        sections.push({
            section: "Administracao",
            items: [
                {
                    label: "Logs",
                    path: "/admin/logs",
                    icon: FileClock,
                },
                {
                    label: "Usuarios",
                    path: "/admin/usuarios",
                    icon: Shield,
                },
            ],
        });
    }

    return sections;
}
