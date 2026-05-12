import React, { Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/modules/auth/context/useAuth";
import { AdminLayout } from "./AdminLayout";
import { DashboardHeader, RecentOrders, StatsCard, StatsSkeleton } from "./components";
import { useDashboardData } from "./useDashboardData";
import type { MonthlyOrdersPoint } from "./types";

interface ChartsPanelProps {
    adoptions: MonthlyOrdersPoint[];
    animals?: MonthlyOrdersPoint[];
    adopters?: MonthlyOrdersPoint[];
}

const ChartsPanel: React.ComponentType<ChartsPanelProps> = import.meta.env.MODE === "test"
    ? ({ adoptions }) => (
          <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_50px_-30px_rgb(15_23_42/0.35)] backdrop-blur-sm sm:p-6 dark:border-slate-700/60 dark:bg-slate-950/60">
              <header className="mb-6 flex flex-col gap-4 border-b border-slate-200/70 pb-4 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Indicador mensal</p>
                      <h3 className="mt-2 text-lg font-semibold tracking-tight text-gray-950 dark:text-white">Adocoes por mes</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ultimos 12 meses</p>
                  </div>
                  <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
                      {adoptions[adoptions.length - 1]?.value ?? 0} adocoes no ultimo mes
                  </div>
              </header>

              <div className="rounded-[20px] border border-slate-200/70 bg-gradient-to-b from-orange-50/70 via-white to-white p-3 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950/80 sm:p-4">
                  <div className="grid min-h-72 place-items-center rounded-[16px] border border-dashed border-slate-200 bg-white/60 px-4 py-10 text-center text-sm text-gray-400 dark:border-slate-700 dark:bg-slate-950/30">
                      <div className="max-w-sm">
                          <p className="font-medium text-gray-500 dark:text-gray-300">Visualização em modo de teste.</p>
                          <p className="mt-1 text-xs leading-5 text-gray-400 dark:text-gray-500">A renderização real do gráfico aparece em produção com Chart.js.</p>
                      </div>
                  </div>
              </div>
          </section>
      )
    : React.lazy(() => import("./components/ChartsPanel"));

export function DashboardPage() {
    const { user } = useAuth();
    const { data: dashboardData, loading, error } = useDashboardData();

    return (
        <>
            <Helmet>
                <title>Bonny | Dashboard</title>
            </Helmet>

            <AdminLayout>
                <main className="relative min-h-screen overflow-hidden px-3 py-5 sm:px-4 md:px-8 md:py-10">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.10),transparent_24%)]" />

                    <div className="relative mx-auto w-full max-w-7xl">
                        <div className=" md:mt-0">
                            <DashboardHeader
                                userEmail={user?.email}
                                animals={dashboardData.animals}
                                adopters={dashboardData.adopters}
                                adoptions={dashboardData.adoptions}
                            />
                        </div>

                        <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 *:min-w-0 sm:grid-cols-2 xl:grid-cols-4">
                            {loading
                                ? Array.from({ length: 4 }).map((_, index) => <StatsSkeleton key={index} />)
                                : dashboardData.stats.map((card) => <StatsCard key={card.title} {...card} />)}
                        </div>

                        {error ? (
                            <div className="mb-6 rounded-[20px] border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700 shadow-sm backdrop-blur dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                                {error}
                            </div>
                        ) : null}

                        <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1.75fr)_minmax(360px,0.8fr)]">
                            <div className="min-w-0">
                                {loading ? (
                                    <div className="h-108 animate-pulse rounded-[24px] border border-white/70 bg-white/80 shadow-[0_18px_50px_-30px_rgb(15_23_42/0.35)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-950/60 sm:h-[31rem] lg:h-[34rem]" />
                                ) : (
                                    <Suspense
                                        fallback={
                                            <div className="h-[27rem] animate-pulse rounded-[24px] border border-white/70 bg-white/80 shadow-[0_18px_50px_-30px_rgb(15_23_42/0.35)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-950/60 sm:h-[31rem] lg:h-[34rem]" />
                                        }
                                    >
                                        <ChartsPanel
                                            adoptions={dashboardData.monthlyAdoptions}
                                            animals={dashboardData.monthlyAnimals}
                                            adopters={dashboardData.monthlyAdopters}
                                        />
                                    </Suspense>
                                )}
                            </div>

                            <RecentOrders loading={loading} orders={dashboardData.recentAdoptions} />
                        </section>
                    </div>
                </main>
            </AdminLayout>
        </>
    );
}
