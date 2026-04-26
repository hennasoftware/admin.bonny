import type { LucideIcon } from "lucide-react";

export interface DashboardStat {
    title: string;
    value: string;
    growth: string;
    icon: LucideIcon;
}

export interface MonthlyOrdersPoint {
    month: string;
    value: number;
}

export interface RecentOrder {
    id: string;
    petName: string;
    adopterName: string;
    status: "Concluída" | "Em análise" | "Agendada";
    date: string;
}

export interface DashboardSnapshot {
    stats: DashboardStat[];
    monthlyAdoptions: MonthlyOrdersPoint[];
    recentAdoptions: RecentOrder[];
}
