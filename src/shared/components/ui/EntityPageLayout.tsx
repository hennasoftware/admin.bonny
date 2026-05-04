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
        <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-100 px-4 py-20 md:px-8 md:py-10 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
            <div className={`mx-auto w-full ${maxWidthClasses[maxWidth]}`}>{children}</div>
        </main>
    );
}

export function EntityPageHeader({ eyebrow, title, description, action }: EntityPageHeaderProps) {
    return (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
                    {eyebrow}
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 dark:text-white">
                    {title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>

            {action ? <div className="flex w-full md:w-auto md:justify-end">{action}</div> : null}
        </div>
    );
}

export function EntityAlert({ children, tone = "success" }: EntityAlertProps) {
    const toneClassName =
        tone === "error"
            ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
            : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300";

    return <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${toneClassName}`}>{children}</div>;
}

export function EntityStatsGrid({ items }: EntityStatsGridProps) {
    return (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
                <div
                    key={item.label}
                    className="rounded-2xl border border-orange-100 bg-white/92 p-4 shadow-sm dark:border-orange-500/10 dark:bg-slate-900/88"
                >
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">{item.label}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 dark:text-white">
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
            className={`rounded-4xl border border-orange-100 bg-white/92 p-5 shadow-sm dark:border-orange-500/10 dark:bg-slate-900/88 md:p-6 ${className}`.trim()}
        >
            {children}
        </section>
    );
}
