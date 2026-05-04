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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="Fechar modal"
                onClick={onClose}
                disabled={closeDisabled}
                className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            />

            <div
                className={`relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-4xl border border-orange-100 bg-white shadow-2xl dark:border-orange-500/10 dark:bg-slate-950 ${maxWidthClassName}`}
            >
                <div className="flex items-start justify-between gap-4 border-b border-orange-100 px-6 py-5 dark:border-orange-500/10">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-950 dark:text-white">{title}</h2>
                        {description ? (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
                        ) : null}
                    </div>

                    <Button type="button" variant="secondary" onClick={onClose} disabled={closeDisabled}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className={`overflow-y-auto ${bodyClassName}`}>{children}</div>
            </div>
        </div>
    );
}
