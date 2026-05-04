import { Modal } from "@/shared/components/ui";
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
        <Modal
            open={!!animal}
            title="Editar animal"
            description={`Atualize as informações de ${animal.name}`}
            onClose={onClose}
            closeDisabled={loading}
            bodyClassName="p-3"
        >
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
        </Modal>
    );
}
