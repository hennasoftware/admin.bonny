export function LoadingGlobal() {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-4 py-8
            bg-linear-to-br from-orange-50 via-white to-orange-100
            dark:from-gray-950 dark:via-slate-900 dark:to-gray-950"
        >
            <div className="absolute inset-0 bg-white/55 dark:bg-slate-950/55 backdrop-blur-sm" />
            <div
                className="absolute inset-0 opacity-90
                bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.18),transparent_34%),radial-gradient(circle_at_bottom,rgba(251,146,60,0.14),transparent_28%)]
                dark:bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.16),transparent_34%),radial-gradient(circle_at_bottom,rgba(249,115,22,0.12),transparent_28%)]"
            />

            <div
                className="relative flex flex-col items-center gap-5 text-center
                min-w-60
                bg-white/78 dark:bg-slate-900/78
                backdrop-blur-md
                rounded-2xl
                shadow-[0_24px_80px_rgba(249,115,22,0.12)] dark:shadow-[0_24px_80px_rgba(15,23,42,0.55)]
                border border-orange-100/80 dark:border-orange-500/12
                px-10 py-8"
            >
                <div className="relative flex items-center justify-center">
                    <span
                        className="absolute h-16 w-16 rounded-full border border-orange-300/70 dark:border-orange-400/30 animate-ping opacity-50"
                    />

                    <span
                        className="h-12 w-12 rounded-full border-4 border-orange-500 dark:border-orange-400
                        border-t-transparent dark:border-t-transparent animate-spin"
                    />

                    <span className="absolute h-7 w-7 rounded-full bg-orange-400/30 dark:bg-orange-300/25 blur-md" />
                </div>
                <p className="text-sm font-medium tracking-[0.01em] text-gray-700 dark:text-gray-200 animate-pulse">
                    Carregando sistema...
                </p>
            </div>
        </div>
    );
}
