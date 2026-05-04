import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface ConfirmDeleteModalProps {
    open: boolean;
    title: string;
    description: string;
    itemLabel?: string;
    loading?: boolean;
    confirmLabel?: string;
    cancelLabel?: string;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
}

export function ConfirmDeleteModal({
    open,
    title,
    description,
    itemLabel,
    loading = false,
    confirmLabel = "Excluir",
    cancelLabel = "Cancelar",
    onClose,
    onConfirm,
}: ConfirmDeleteModalProps) {
    return (
        <Modal
            open={open}
            title={title}
            description={description}
            onClose={onClose}
            maxWidthClassName="max-w-xl"
            bodyClassName="p-6"
            closeDisabled={loading}
        >
            <div className="space-y-6">
                <div className="flex items-start gap-4 rounded-3xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                    <div className="rounded-2xl bg-red-100 p-3 text-red-600 dark:bg-red-500/20 dark:text-red-300">
                        <AlertTriangle className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">
                            Esta ação não pode ser desfeita.
                        </p>
                        {itemLabel ? (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-200">
                                Registro selecionado: <span className="font-semibold">{itemLabel}</span>
                            </p>
                        ) : null}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                        {cancelLabel}
                    </Button>
                    <Button type="button" variant="danger" onClick={() => void onConfirm()} isLoading={loading} disabled={loading}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
