import type { LucideIcon } from "lucide-react";
import type { AdoptionStatus } from "@/modules/adoptions/services/service";
import type { AdoptionRecord } from "@/modules/adoptions/services/service";
import type { AdopterRecord } from "@/modules/adopters/types";
import type { AnimalRecord } from "@/modules/animals/types/types";

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
    notesPreview?: string;
}

export interface DashboardSnapshot {
    stats: DashboardStat[];
    monthlyAdoptions: MonthlyOrdersPoint[];
    monthlyAnimals?: MonthlyOrdersPoint[];
    monthlyAdopters?: MonthlyOrdersPoint[];
    chartHighlight: string;
    chartTrend: string;
    recentAdoptions: RecentOrder[];
    animals: AnimalRecord[];
    adopters: AdopterRecord[];
    adoptions: AdoptionRecord[];
}

export interface DashboardSummaryRecord {
    id: string;
    animalsAvailable: number;
    animalsInProcess: number;
    animalsTotal: number;
    adoptersActive: number;
    adoptionsCompletedTotal: number;
    adoptionsOpen: number;
}

export interface DashboardMonthlyAggregateRecord {
    id: string;
    animals?: number;
    adopters?: number;
    adoptions?: number;
}
