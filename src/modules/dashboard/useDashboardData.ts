import { useEffect, useState } from "react";
import { formatMonthLabel } from "@/shared/utils/date";
import { subscribeDashboardSnapshot } from "./service";
import type { DashboardSnapshot, MonthlyOrdersPoint } from "./types";

function createEmptyMonthlySeries(): MonthlyOrdersPoint[] {
    const today = new Date();

    return Array.from({ length: 12 }, (_, index) => {
        const date = new Date(today.getFullYear(), today.getMonth() - (11 - index), 1);
        return {
            month: formatMonthLabel(date),
            value: 0,
        };
    });
}

const EMPTY_DASHBOARD: DashboardSnapshot = {
    stats: [],
    monthlyAdoptions: createEmptyMonthlySeries(),
    monthlyAnimals: createEmptyMonthlySeries(),
    monthlyAdopters: createEmptyMonthlySeries(),
    chartHighlight: "0",
    chartTrend: "Sem dados recentes",
    recentAdoptions: [],
    animals: [],
    adopters: [],
    adoptions: [],
};

export function useDashboardData() {
    const [data, setData] = useState<DashboardSnapshot>(EMPTY_DASHBOARD);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeDashboardSnapshot(
            (snapshot) => {
                setData(snapshot);
                setError(null);
                setLoading(false);
            },
            () => {
                setError("Nao foi possivel carregar os indicadores do dashboard.");
                setLoading(false);
            },
        );

        return unsubscribe;
    }, []);

    return {
        data,
        loading,
        error,
    };
}
