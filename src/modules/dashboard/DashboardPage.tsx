import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/context/AuthContext";
import { Button } from "@/shared/components/ui";
import { dashboardStats, monthlyOrders, recentOrders } from "./data";
import {
    Chart,
    DashboardHeader,
    RecentOrders,
    StatsCard,
    StatsSkeleton,
} from "./components";

export function DashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setLoading(false);
        }, 900);

        return () => window.clearTimeout(timer);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <>
            <Helmet>
                <title>Bonny | Dashboard</title>
            </Helmet>

            <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-100 px-4 py-10 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="mb-8 flex justify-end">
                        <Button onClick={handleLogout} variant="secondary" className="px-3.5">
                            <LogOut className="h-4 w-4" />
                            Sair do sistema
                        </Button>
                    </div>

                    <DashboardHeader userEmail={user?.email} />

                    <div className="mb-6 grid min-w-0 grid-cols-1 gap-6 *:min-w-0 sm:grid-cols-2 xl:grid-cols-4">
                        {loading
                            ? Array.from({ length: 4 }).map((_, index) => <StatsSkeleton key={index} />)
                            : dashboardStats.map((card) => <StatsCard key={card.title} {...card} />)}
                    </div>

                    <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                        <div className="min-w-0 xl:col-span-2">
                            {loading ? (
                                <div className="h-90 animate-pulse rounded-2xl border border-orange-100 bg-white/90 sm:h-107.5 dark:border-orange-500/10 dark:bg-slate-900/85" />
                            ) : (
                                <Chart
                                    title="Orders per month"
                                    description="Last 12 months"
                                    data={monthlyOrders}
                                />
                            )}
                        </div>

                        <RecentOrders loading={loading} orders={recentOrders} />
                    </section>
                </div>
            </main>
        </>
    );
}
