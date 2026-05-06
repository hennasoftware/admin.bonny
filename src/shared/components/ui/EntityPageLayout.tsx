import type { ReactNode } from "react";

interface EntityPageShellProps {
    children: ReactNode;
    maxWidth?: "4xl" | "5xl" | "6xl" | "7xl";
}

interface EntityPageHeaderProps {
    eyebrow: string;
    title: string;
    description: string;
    action?: ReactNode;
}

interface EntityAlertProps {
    children: ReactNode;
    tone?: "success" | "error";
}

interface EntityStatsGridProps {
    items: Array<{
        label: string;
        value: string | number;
    }>;
}

interface EntitySectionCardProps {
    children: ReactNode;
    className?: string;
}

const maxWidthClasses: Record<NonNullable<EntityPageShellProps["maxWidth"]>, string> = {
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
};

export function EntityPageShell({ children, maxWidth = "7xl" }: EntityPageShellProps) {
    return (
        <main className="min-h-screen bg-transparent px-3 py-8 sm:px-4 md:px-8 md:py-10">
            <div className={`mx-auto w-full ${maxWidthClasses[maxWidth]}`}>{children}</div>
        </main>
    );
}

export function EntityPageHeader({ eyebrow, title, description, action }: EntityPageHeaderProps) {
    return (
        <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-orange-100/70 bg-white/75 p-5 shadow-[0_18px_50px_-34px_rgb(15_23_42/0.28)] backdrop-blur-sm md:flex-row md:items-end md:justify-between md:p-6 dark:border-slate-700/60 dark:bg-slate-950/60">
            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
                    {eyebrow}
                </p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl dark:text-white">
                    {title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">{description}</p>
            </div>

            {action ? <div className="flex w-full md:w-auto md:justify-end">{action}</div> : null}
        </div>
    );
}

export function EntityAlert({ children, tone = "success" }: EntityAlertProps) {
    const toneClassName =
        tone === "error"
            ? "border-red-200 bg-red-50/95 text-red-700 shadow-[0_16px_40px_-30px_rgb(220_38_38/0.35)] dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
            : "border-emerald-200 bg-emerald-50/95 text-emerald-700 shadow-[0_16px_40px_-30px_rgb(16_185_129/0.35)] dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300";

    return <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm backdrop-blur-sm ${toneClassName}`}>{children}</div>;
}

export function EntityStatsGrid({ items }: EntityStatsGridProps) {
    return (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
                <div
                    key={item.label}
                    className="rounded-[24px] border border-orange-100/70 bg-white/82 p-4 shadow-[0_16px_40px_-30px_rgb(15_23_42/0.32)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-950/60"
                >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl dark:text-white">
                        {item.value}
                    </p>
                </div>
            ))}
        </div>
    );
}

export function EntitySectionCard({ children, className = "" }: EntitySectionCardProps) {
    return (
        <section
            className={`rounded-[28px] border border-orange-100/70 bg-white/82 p-5 shadow-[0_18px_50px_-34px_rgb(15_23_42/0.28)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-950/60 md:p-6 ${className}`.trim()}
        >
            {children}
        </section>
    );
}
