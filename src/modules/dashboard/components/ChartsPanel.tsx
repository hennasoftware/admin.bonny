import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip, type ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import type { MonthlyOrdersPoint } from "../types";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

interface ChartsPanelProps {
    adoptions: MonthlyOrdersPoint[];
    animals?: MonthlyOrdersPoint[];
    adopters?: MonthlyOrdersPoint[];
}

const TICK_COUNT = 4;

function buildIntegerScale(maxValue: number) {
    const step = Math.max(1, Math.ceil(maxValue / TICK_COUNT));
    return step * TICK_COUNT;
}

function isCompactViewport() {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 1024;
}

function buildBarOptions(scaleMax: number, compact: boolean): ChartOptions<"bar"> {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
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
                top: 6,
                right: 4,
                bottom: 0,
                left: 0,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: "#94a3b8",
                    font: { size: 11 },
                    autoSkip: compact,
                    maxTicksLimit: compact ? 4 : 12,
                    maxRotation: 0,
                },
            },
            y: {
                beginAtZero: true,
                min: 0,
                max: scaleMax,
                ticks: {
                    stepSize: Math.max(1, Math.ceil(scaleMax / TICK_COUNT)),
                    color: "#94a3b8",
                    font: { size: 11 },
                    precision: 0,
                },
                grid: {
                    color: "rgba(148, 163, 184, 0.20)",
                },
            },
        },
    };
}

function MetricBarCard({
    title,
    description,
    points,
    color,
    accent,
}: {
    title: string;
    description: string;
    points: MonthlyOrdersPoint[];
    color: string;
    accent: string;
}) {
    const compact = isCompactViewport();
    const dataPoints = points.length ? points : [];
    const latestValue = dataPoints[dataPoints.length - 1]?.value ?? 0;
    const maxValue = Math.max(...dataPoints.map((point) => point.value), 1);
    const scaleMax = buildIntegerScale(maxValue);
    const chartData = {
        labels: dataPoints.map((point) => point.month),
        datasets: [
            {
                label: title,
                data: dataPoints.map((point) => point.value),
                backgroundColor: color,
                borderRadius: 12,
                barPercentage: compact ? 0.8 : 0.72,
                categoryPercentage: compact ? 0.86 : 0.78,
            },
        ],
    };

    return (
        <section className="rounded-[24px] border border-white/70 bg-white/80 p-4 shadow-[0_18px_50px_-30px_rgb(15_23_42/0.35)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-950/60 sm:p-6">
            <header className="mb-5 border-b border-slate-200/70 pb-4 dark:border-slate-800">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Cadastros mensais</p>
                        <h4 className="mt-2 text-sm font-semibold tracking-tight text-gray-950 dark:text-white sm:text-base">{title}</h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
                    </div>

                    <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${accent}`}>
                        {latestValue} no ultimo mes
                    </div>
                </div>
            </header>

            <div className="rounded-[20px] border border-slate-200/70 bg-gradient-to-b from-white to-slate-50 p-3 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900/70 sm:p-4">
                <div className="h-56 w-full sm:h-64 lg:h-72">
                    <Bar data={chartData} options={buildBarOptions(scaleMax, compact)} />
                </div>
            </div>
        </section>
    );
}

export default function ChartsPanel({ adoptions, animals = [], adopters = [] }: ChartsPanelProps) {
    return (
        <div className="space-y-6">
            <MetricBarCard
                title="Adocoes por mes"
                description="Ultimos 12 meses em ordem cronologica"
                points={adoptions}
                color="#f97316"
                accent="border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200"
            />

            <div className="grid grid-cols-1 gap-6">
                <MetricBarCard
                    title="Animais cadastrados"
                    description="Volume mensal de novos cadastros"
                    points={animals.length ? animals : adoptions}
                    color="#06b6d4"
                    accent="border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-200"
                />

                <MetricBarCard
                    title="Adotantes cadastrados"
                    description="Entrada mensal de novos adotantes"
                    points={adopters.length ? adopters : adoptions}
                    color="#10b981"
                    accent="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                />
            </div>
        </div>
    );
}
