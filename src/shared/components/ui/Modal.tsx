import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";

interface ModalProps {
    open: boolean;
    title: string;
    description?: string;
    onClose: () => void;
    children: ReactNode;
    maxWidthClassName?: string;
    bodyClassName?: string;
    closeDisabled?: boolean;
}

export function Modal({
    open,
    title,
    description,
    onClose,
    children,
    maxWidthClassName = "max-w-4xl",
    bodyClassName = "p-6",
    closeDisabled = false,
}: ModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <button
                type="button"
                aria-label="Fechar modal"
                onClick={onClose}
                disabled={closeDisabled}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            />

            <div
                className={`relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_30px_100px_-40px_rgb(15_23_42/0.6)] dark:border-slate-700/60 dark:bg-slate-950 ${maxWidthClassName}`}
            >
                <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 px-5 py-4 sm:px-6 dark:border-slate-800">
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white sm:text-xl">{title}</h2>
                        {description ? <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p> : null}
                    </div>

                    <Button type="button" variant="secondary" onClick={onClose} disabled={closeDisabled} className="h-10 w-10 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className={`overflow-y-auto ${bodyClassName}`}>{children}</div>
            </div>
        </div>
    );
}
