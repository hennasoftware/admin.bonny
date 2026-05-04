import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/modules/auth/context/useAuth";
import { AdminLayout } from "./AdminLayout";
import { Chart, DashboardHeader, RecentOrders, StatsCard, StatsSkeleton } from "./components";
import { subscribeDashboardSnapshot } from "./service";
import type { DashboardSnapshot } from "./types";

export function DashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardSnapshot | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeDashboardSnapshot(
            (snapshot) => {
                setDashboardData(snapshot);
                setError(null);
                setLoading(false);
            },
            () => {
                setError("Nao foi possivel carregar os indicadores do dashboard.");
                setLoading(false);
            },
        );

        return () => unsubscribe();
    }, []);

    return (
        <>
            <Helmet>
                <title>Bonny | Dashboard</title>
            </Helmet>

            <AdminLayout>
                <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-100 px-4 py-20 md:px-8 md:py-10 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
                    <div className="mx-auto w-full max-w-7xl">
                        <DashboardHeader userEmail={user?.email} />

                        <div className="mb-6 grid min-w-0 grid-cols-1 gap-6 *:min-w-0 sm:grid-cols-2 xl:grid-cols-4">
                            {loading
                                ? Array.from({ length: 4 }).map((_, index) => <StatsSkeleton key={index} />)
                                : dashboardData?.stats.map((card) => <StatsCard key={card.title} {...card} />)}
                        </div>

                        {error ? (
                            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                                {error}
                            </div>
                        ) : null}

                        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                            <div className="min-w-0 xl:col-span-2">
                                {loading ? (
                                    <div className="h-90 animate-pulse rounded-2xl border border-orange-100 bg-white/90 sm:h-107.5 dark:border-orange-500/10 dark:bg-slate-900/85" />
                                ) : (
                                    <Chart
                                        title="Adocoes por mes"
                                        description="Ultimos 12 meses"
                                        data={dashboardData?.monthlyAdoptions ?? []}
                                        highlight={dashboardData?.chartHighlight ?? "0"}
                                        trend={dashboardData?.chartTrend ?? "Sem dados recentes"}
                                    />
                                )}
                            </div>

                            <RecentOrders loading={loading} orders={dashboardData?.recentAdoptions ?? []} />
                        </section>
                    </div>
                </main>
            </AdminLayout>
        </>
    );
}
