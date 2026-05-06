export function StatsSkeleton() {
    return (
        <div className="min-w-0 overflow-hidden rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_-30px_rgb(15_23_42/0.35)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-950/60">
            <div className="animate-pulse">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                    <div className="h-6 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="h-3.5 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="mt-4 h-9 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
        </div>
    );
}
