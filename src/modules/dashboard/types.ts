import type { LucideIcon } from "lucide-react";
import type { AdoptionStatus } from "@/modules/adoptions/services/service";

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
    status: AdoptionStatus;
    date: string;
}

export interface DashboardSnapshot {
    stats: DashboardStat[];
    monthlyAdoptions: MonthlyOrdersPoint[];
    chartHighlight: string;
    chartTrend: string;
    recentAdoptions: RecentOrder[];
}
