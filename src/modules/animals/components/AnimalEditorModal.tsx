import { AnimalForm } from "./AnimalForm";
import type { AnimalFormState, AnimalRecord } from "../types/types";
import { toAnimalFormState } from "../services/service";

interface AnimalEditorModalProps {
    animal: AnimalRecord | null;
    onClose: () => void;
    onSubmit: (animalId: string, values: AnimalFormState) => Promise<void>;
    loading: boolean;
}

export function AnimalEditorModal({ animal, onClose, onSubmit, loading }: AnimalEditorModalProps) {
    if (!animal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <button
                type="button"
                aria-label="Fechar edição"
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            />

            <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-4xl border border-orange-100 bg-white shadow-2xl dark:border-orange-500/10 dark:bg-slate-950">
                <div className="max-h-[90vh] overflow-y-auto p-2 md:p-3">
                    <AnimalForm
                        key={animal.id}
                        initialValues={toAnimalFormState(animal)}
                        submitLabel="Salvar alterações"
                        cancelLabel="Fechar"
                        loading={loading}
                        onCancel={onClose}
                        onSubmit={async (values) => {
                            await onSubmit(animal.id, values);
                            onClose();
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
