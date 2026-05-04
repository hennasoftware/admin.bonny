import type { AppDateValue } from "@/shared/utils/date";

export type AdopterStatus = "Ativo" | "Inativo" | "Bloqueado";

export interface AdopterRecord {
    id: string;
    name: string;
    email: string;
    phone: string;
    cpf: string;
    address: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
    };
    status: AdopterStatus;
    notes?: string;
    createdAt: AppDateValue;
    updatedAt?: AppDateValue;
}

export interface AdopterFormState {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    address: {
        street: string;
        number: string;
        complement: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
    };
    status: AdopterStatus;
    notes: string;
}
