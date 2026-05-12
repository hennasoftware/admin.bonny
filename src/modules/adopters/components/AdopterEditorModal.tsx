import { Modal } from "@/shared/components/ui";
import type { AdopterFormState, AdopterRecord } from "../types";
import { AdopterForm } from "./AdopterForm";

interface AdopterEditorModalProps {
    adopter: AdopterRecord | null;
    loading?: boolean;
    submitError?: string | null;
    onClose: () => void;
    onSubmit: (adopterId: string, values: AdopterFormState) => void;
}

export function AdopterEditorModal({
    adopter,
    loading = false,
    submitError,
    onClose,
    onSubmit,
}: AdopterEditorModalProps) {
    if (!adopter) return null;

    return (
        <Modal
            open={!!adopter}
            title="Editar adotante"
            description={`Atualize as informacoes de ${adopter.name}`}
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
                submitLabel="Salvar alteracoes"
                cancelLabel="Fechar"
                loading={loading}
                submitError={submitError}
                onCancel={onClose}
                onSubmit={(values) => {
                    onSubmit(adopter.id, values);
                }}
            />
        </Modal>
    );
}
