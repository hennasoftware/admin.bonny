import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

type ToastTone = "success" | "error";

interface ToastItem {
    id: number;
    message: string;
    tone: ToastTone;
}

interface ToastContextValue {
    showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismissToast = useCallback((id: number) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message: string, tone: ToastTone = "success") => {
        const id = Date.now() + Math.floor(Math.random() * 1000);
        setToasts((current) => [...current, { id, message, tone }]);
    }, []);

    useEffect(() => {
        if (toasts.length === 0) return;

        const timer = window.setTimeout(() => {
            dismissToast(toasts[0].id);
        }, 4000);

        return () => window.clearTimeout(timer);
    }, [dismissToast, toasts]);

    const value = useMemo(() => ({ showToast }), [showToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}

            <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-3">
                {toasts.map((toast) => {
                    const isSuccess = toast.tone === "success";
                    const Icon = isSuccess ? CheckCircle2 : CircleAlert;

                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${
                                isSuccess
                                    ? "border-emerald-200 bg-white text-emerald-700 dark:border-emerald-500/20 dark:bg-slate-900 dark:text-emerald-300"
                                    : "border-red-200 bg-white text-red-700 dark:border-red-500/20 dark:bg-slate-900 dark:text-red-300"
                            }`}
                        >
                            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                            <p className="flex-1 text-sm font-medium">{toast.message}</p>
                            <button
                                type="button"
                                onClick={() => dismissToast(toast.id)}
                                className="rounded-full p-1 text-current/70 transition hover:bg-black/5 hover:text-current dark:hover:bg-white/5"
                                aria-label="Fechar aviso"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }

    return context;
}
