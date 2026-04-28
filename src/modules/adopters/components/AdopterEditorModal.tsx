import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { AdopterForm } from "./AdopterForm";
import type { AdopterRecord, AdopterFormState } from "../types";

interface AdopterEditorModalProps {
    adopter: AdopterRecord | null;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (adopterId: string, values: AdopterFormState) => void;
}

export function AdopterEditorModal({
    adopter,
    loading = false,
    onClose,
    onSubmit,
}: AdopterEditorModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(!!adopter);
    }, [adopter]);

    const handleClose = () => {
        setIsOpen(false);
        onClose();
    };

    const handleSubmit = (values: AdopterFormState) => {
        if (adopter) {
            onSubmit(adopter.id, values);
        }
    };

    if (!isOpen || !adopter) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            Editar adotante
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Atualize as informações de {adopter.name}
                        </p>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-6">
                    <AdopterForm
                        initialValues={{
                            ...adopter,
                            address: {
                                ...adopter.address,
                                complement: adopter.address.complement || "",
                            },
                            notes: adopter.notes || "",
                        }}
                        submitLabel="Salvar alterações"
                        loading={loading}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
        </div>
    );
}
