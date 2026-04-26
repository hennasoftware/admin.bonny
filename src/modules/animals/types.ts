export type AnimalSex = "Macho" | "Fêmea" | "Desconhecido";
export type AnimalSize = "Pequeno" | "Médio" | "Grande" | "Gigante";
export type AnimalStatus = "Disponível" | "Em processo" | "Adotado";

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
    createdAt: string;
    updatedAt?: string;
}

export interface AnimalFormState {
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
    notes: string;
}
