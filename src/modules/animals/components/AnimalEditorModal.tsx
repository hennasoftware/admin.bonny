import { Modal } from "@/shared/components/ui";
import { toAnimalFormState } from "../services/service";
import type { AnimalFormState, AnimalRecord } from "../types/types";
import { getAnimalCodeLabel } from "../utils/code";
import { AnimalForm } from "./AnimalForm";

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
            description={`Atualize as informacoes de ${animal.name}`}
            onClose={onClose}
            closeDisabled={loading}
            bodyClassName="p-3"
        >
            <AnimalForm
                key={animal.id}
                initialValues={toAnimalFormState(animal)}
                animalCode={getAnimalCodeLabel(animal)}
                submitLabel="Salvar alteracoes"
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
