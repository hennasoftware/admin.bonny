export function StatsSkeleton() {
    return (
        <div className="min-w-0 rounded-2xl border border-orange-100 bg-white/90 p-5 shadow-sm dark:border-orange-500/10 dark:bg-slate-900/85">
            <div className="animate-pulse">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="h-11 w-11 rounded-xl bg-orange-100 dark:bg-slate-800" />
                    <div className="h-7 w-28 rounded-full bg-orange-100 dark:bg-slate-800" />
                </div>

                <div className="h-4 w-24 rounded bg-orange-100 dark:bg-slate-800" />
                <div className="mt-3 h-9 w-20 rounded bg-orange-100 dark:bg-slate-800" />
            </div>
        </div>
    );
}
