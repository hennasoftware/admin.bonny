import type { AppDateValue } from "@/shared/utils/date";

export type AnimalSex = "Macho" | "Femea" | "Desconhecido";
export type AnimalSize = "Pequeno" | "Medio" | "Grande" | "Gigante";
export type AnimalStatus = "Disponivel" | "Em processo" | "Adotado";

export interface AnimalRecord {
    id: string;
    name: string;
    species: string;
    breed: string;
    sex: AnimalSex;
    age: string;
    size: AnimalSize;
    color: string;
    status: AnimalStatus;
    neutered: boolean;
    vaccinated: boolean;
    notes?: string;
    createdAt: AppDateValue;
    updatedAt?: AppDateValue;
}

export interface AnimalFormState {
    name: string;
    species: string;
    breed: string;
    sex: AnimalSex;
    size: AnimalSize;
    age: string;
    color: string;
    status: AnimalStatus;
    neutered: boolean;
    vaccinated: boolean;
    notes: string;
}
