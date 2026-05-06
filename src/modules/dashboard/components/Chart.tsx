import { CategoryScale, Chart as ChartJS, Filler, LinearScale, LineElement, PointElement, Tooltip, type ChartData, type ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import type { MonthlyOrdersPoint } from "../types";

ChartJS.register(CategoryScale, Filler, LinearScale, LineElement, PointElement, Tooltip);

interface ChartProps {
    title: string;
    description: string;
    data: MonthlyOrdersPoint[];
    highlight: string;
    trend: string;
}

function buildIntegerScale(maxValue: number) {
    const tickCount = 4;
    const step = Math.max(1, Math.ceil(maxValue / tickCount));
    return step * tickCount;
}

function isCompactViewport() {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 1024;
}

export function Chart({ title, description, data, highlight, trend }: ChartProps) {
    const scaleMax = buildIntegerScale(Math.max(...data.map((item) => item.value), 1));
    const compact = isCompactViewport();
    const labels = data.map((item, index) => (compact && index % 2 === 1 ? "" : item.month));

    const chartData: ChartData<"line"> = {
        labels,
        datasets: [
            {
                label: "Adocoes concluidas",
                data: data.map((item) => item.value),
                borderColor: "#f97316",
                backgroundColor: "rgba(249, 115, 22, 0.18)",
                pointBackgroundColor: "#f97316",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.42,
                fill: true,
            },
        ],
    };

    const options: ChartOptions<"line"> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: "index",
            intersect: false,
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                padding: 12,
                displayColors: false,
                backgroundColor: "rgba(15, 23, 42, 0.96)",
                titleColor: "#e2e8f0",
                bodyColor: "#ffffff",
                borderColor: "rgba(148, 163, 184, 0.18)",
                borderWidth: 1,
            },
        },
        layout: {
            padding: {
                top: 4,
                right: 8,
                bottom: 0,
                left: 0,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: "#94a3b8",
                    font: {
                        size: 11,
                    },
                    maxRotation: 0,
                    autoSkip: compact,
                    maxTicksLimit: compact ? 4 : 12,
                },
            },
            y: {
                beginAtZero: true,
                min: 0,
                max: scaleMax,
                ticks: {
                    stepSize: Math.max(1, Math.ceil(scaleMax / 4)),
                    color: "#94a3b8",
                    font: {
                        size: 11,
                    },
                    precision: 0,
                },
                grid: {
                    color: "rgba(148, 163, 184, 0.20)",
                },
            },
        },
    };

    return (
        <section className="rounded-[24px] border border-white/70 bg-white/80 p-4 shadow-[0_18px_50px_-30px_rgb(15_23_42/0.35)] backdrop-blur-sm sm:p-6 dark:border-slate-700/60 dark:bg-slate-950/60">
            <header className="mb-6 flex flex-col gap-4 border-b border-slate-200/70 pb-4 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Indicador mensal</p>
                    <h2 className="mt-2 text-lg font-semibold tracking-tight text-gray-950 dark:text-white">{title}</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
                    <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
                        {trend}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-gray-950 dark:text-white">{highlight}</span> adocoes concluidas
                    </p>
                </div>
            </header>

            <div className="rounded-[20px] border border-slate-200/70 bg-gradient-to-b from-orange-50/70 via-white to-white p-3 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950/80 sm:p-4">
                <div className="h-60 w-full sm:h-72 lg:h-80">
                    <Line data={chartData} options={options} />
                </div>
            </div>
        </section>
    );
}
