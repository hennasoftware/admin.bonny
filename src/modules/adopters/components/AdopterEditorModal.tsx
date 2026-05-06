import { Modal } from "@/shared/components/ui";
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
    if (!adopter) return null;

    return (
        <Modal
            open={!!adopter}
            title="Editar adotante"
            description={`Atualize as informações de ${adopter.name}`}
            onClose={onClose}
            closeDisabled={loading}
            bodyClassName="p-3"
        >
            <AdopterForm
                mode="edit"
                initialValues={{
                    ...adopter,
                    address: {
                        ...adopter.address,
                        complement: adopter.address.complement || "",
                    },
                    notes: adopter.notes || "",
                }}
                submitLabel="Salvar alterações"
                cancelLabel="Fechar"
                loading={loading}
                onCancel={onClose}
                onSubmit={(values) => {
                    onSubmit(adopter.id, values);
                    onClose();
                }}
            />
        </Modal>
    );
}
