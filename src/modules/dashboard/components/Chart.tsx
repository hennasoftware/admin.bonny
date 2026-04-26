import type { MonthlyOrdersPoint } from "../types";

interface ChartProps {
    title: string;
    description: string;
    data: MonthlyOrdersPoint[];
}

const WIDTH = 760;
const HEIGHT = 320;
const PADDING_X = 18;
const PADDING_TOP = 18;
const PADDING_BOTTOM = 36;

export function Chart({ title, description, data }: ChartProps) {
    const maxValue = Math.max(...data.map((item) => item.value), 1);
    const drawableWidth = WIDTH - PADDING_X * 2;
    const drawableHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    const stepX = data.length > 1 ? drawableWidth / (data.length - 1) : 0;
    const mobileLabels = data.filter((_, index) => index % 2 === 0);

    const points = data.map((item, index) => {
        const x = PADDING_X + index * stepX;
        const y = PADDING_TOP + drawableHeight - (item.value / maxValue) * drawableHeight;

        return { ...item, x, y };
    });

    const linePath = points
        .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
        .join(" ");

    const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? PADDING_X} ${HEIGHT - PADDING_BOTTOM} L ${points[0]?.x ?? PADDING_X} ${HEIGHT - PADDING_BOTTOM} Z`;
    const yGuides = Array.from({ length: 4 }).map((_, index) => {
        const value = Math.round((maxValue / 4) * (4 - index));
        const y = PADDING_TOP + (drawableHeight / 4) * index;

        return { value, y };
    });

    return (
        <section className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm sm:p-6 dark:border-orange-500/10 dark:bg-slate-900/85">
            <header className="mb-6">
                <h2 className="text-base font-semibold text-gray-950 dark:text-white">{title}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </header>

            <div className="overflow-hidden rounded-2xl border border-orange-100 bg-linear-to-b from-orange-50/60 to-white/40 p-3 sm:p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950/40">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-400">
                            Orders
                        </p>
                        <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
                            {data[data.length - 1]?.value ?? 0}
                        </p>
                    </div>

                    <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                        +18.6% vs previous period
                    </div>
                </div>

                <div className="relative h-[240px] w-full sm:h-[320px]">
                    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="chart-area-fill" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="rgb(249 115 22 / 0.30)" />
                                <stop offset="100%" stopColor="rgb(249 115 22 / 0.04)" />
                            </linearGradient>
                        </defs>

                        {yGuides.map((guide) => (
                            <g key={guide.y}>
                                <line
                                    x1={PADDING_X}
                                    y1={guide.y}
                                    x2={WIDTH - PADDING_X}
                                    y2={guide.y}
                                    stroke="currentColor"
                                    strokeOpacity="0.10"
                                    className="text-orange-500 dark:text-white"
                                />
                                <text
                                    x={0}
                                    y={guide.y + 4}
                                    className="fill-gray-400 text-[11px]"
                                >
                                    {guide.value}
                                </text>
                            </g>
                        ))}

                        <path d={areaPath} fill="url(#chart-area-fill)" />
                        <path
                            d={linePath}
                            fill="none"
                            stroke="rgb(249 115 22)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {points.map((point) => (
                            <g key={point.month}>
                                <circle cx={point.x} cy={point.y} r="6" fill="rgb(255 237 213)" />
                                <circle cx={point.x} cy={point.y} r="4" fill="rgb(249 115 22)" />
                            </g>
                        ))}
                    </svg>
                </div>

                <div className="mt-3 grid grid-cols-6 text-center text-[11px] font-medium text-gray-400 sm:hidden">
                    {mobileLabels.map((point) => (
                        <span key={`${point.month}-mobile`}>{point.month}</span>
                    ))}
                </div>

                <div className="mt-3 hidden grid-cols-12 text-center text-[11px] font-medium text-gray-400 sm:grid">
                    {data.map((point) => (
                        <span key={`${point.month}-desktop`}>{point.month}</span>
                    ))}
                </div>
            </div>
        </section>
    );
}
