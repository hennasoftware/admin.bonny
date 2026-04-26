import { BadgeCheck, CalendarDays, PawPrint, Users } from "lucide-react";
import type { DashboardSnapshot } from "./types";

export const dashboardSnapshotMock: DashboardSnapshot = {
    stats: [
        {
            title: "Adoções ativas",
            value: "128",
            growth: "+12,4% neste mês",
            icon: PawPrint,
        },
        {
            title: "Novos adotantes",
            value: "43",
            growth: "+5,1% nesta semana",
            icon: Users,
        },
        {
            title: "Visitas agendadas",
            value: "19",
            growth: "+3 novas hoje",
            icon: CalendarDays,
        },
        {
            title: "Processos concluídos",
            value: "86%",
            growth: "+8,2% no trimestre",
            icon: BadgeCheck,
        },
    ],
    monthlyAdoptions: [
        { month: "Mai", value: 12 },
        { month: "Jun", value: 18 },
        { month: "Jul", value: 16 },
        { month: "Ago", value: 24 },
        { month: "Set", value: 21 },
        { month: "Out", value: 29 },
        { month: "Nov", value: 27 },
        { month: "Dez", value: 31 },
        { month: "Jan", value: 34 },
        { month: "Fev", value: 28 },
        { month: "Mar", value: 36 },
        { month: "Abr", value: 41 },
    ],
    recentAdoptions: [
        {
            id: "ADO-1042",
            petName: "Luna",
            adopterName: "Mariana Costa",
            status: "Concluída",
            date: "Hoje, 09:20",
        },
        {
            id: "ADO-1041",
            petName: "Thor",
            adopterName: "Rafael Lima",
            status: "Em análise",
            date: "Hoje, 08:05",
        },
        {
            id: "ADO-1038",
            petName: "Nina",
            adopterName: "Beatriz Souza",
            status: "Agendada",
            date: "Ontem, 17:40",
        },
        {
            id: "ADO-1034",
            petName: "Max",
            adopterName: "Lucas Alves",
            status: "Concluída",
            date: "Ontem, 14:15",
        },
    ],
};
