import { BarChart3, Dog, List, PlusCircle, Users } from "lucide-react";
import type { SidebarSection } from "@/shared/components/sidebar";

export const dashboardSidebarItems: SidebarSection[] = [
    {
        section: "Geral",
        items: [
            {
                label: "Dashboard",
                path: "/dashboard",
                icon: BarChart3,
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
        section: "Adoções",
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
