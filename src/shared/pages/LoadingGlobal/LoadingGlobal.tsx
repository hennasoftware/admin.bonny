export function LoadingGlobal() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8
      bg-linear-to-br from-orange-50 via-white to-orange-50
      dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
        >
            <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-sm" />

            <div className="relative flex flex-col items-center gap-4 text-center
        bg-white/80 dark:bg-gray-800/80
        backdrop-blur-md
        rounded-2xl
        shadow-lg dark:shadow-xl
        border border-gray-100 dark:border-gray-700
        px-8 py-6"
            >
                <span
                    className="size-12 animate-spin rounded-full border-4
          border-orange-500 dark:border-orange-400
          border-t-transparent"
                    aria-hidden="true"
                />

                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 animate-pulse">
                    Carregando...
                </p>
            </div>
        </div>
    );
}
