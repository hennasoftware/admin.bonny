import { BadgeCheck, CalendarDays, PawPrint, Users } from "lucide-react";
import type { DashboardStat, MonthlyOrdersPoint, RecentOrder } from "./types";

export const dashboardStats: DashboardStat[] = [
    {
        title: "Adocoes ativas",
        value: "128",
        growth: "+12.4% este mes",
        icon: PawPrint,
    },
    {
        title: "Novos adotantes",
        value: "43",
        growth: "+5.1% esta semana",
        icon: Users,
    },
    {
        title: "Visitas agendadas",
        value: "19",
        growth: "+3 novas hoje",
        icon: CalendarDays,
    },
    {
        title: "Processos concluidos",
        value: "86%",
        growth: "+8.2% no trimestre",
        icon: BadgeCheck,
    },
];

export const monthlyOrders: MonthlyOrdersPoint[] = [
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
];

export const recentOrders: RecentOrder[] = [
    {
        id: "ADO-1042",
        petName: "Luna",
        adopterName: "Mariana Costa",
        status: "Concluida",
        date: "Hoje, 09:20",
    },
    {
        id: "ADO-1041",
        petName: "Thor",
        adopterName: "Rafael Lima",
        status: "Em analise",
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
        status: "Concluida",
        date: "Ontem, 14:15",
    },
];
