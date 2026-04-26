import type { AnimalRecord } from "./types";

export const initialAnimals: AnimalRecord[] = [
    {
        id: "ANM-1004",
        name: "Luna",
        species: "Cachorro",
        breed: "Vira-lata",
        sex: "Fêmea",
        age: "2 anos",
        size: "Médio",
        color: "Caramelo",
        status: "Disponível",
        neutered: true,
        vaccinated: true,
        notes: "Muito dócil com pessoas e cães.",
        createdAt: "Hoje, 09:40",
    },
    {
        id: "ANM-1003",
        name: "Mimi",
        species: "Gato",
        breed: "Siamês",
        sex: "Fêmea",
        age: "1 ano",
        size: "Pequeno",
        color: "Branco e cinza",
        status: "Em processo",
        neutered: true,
        vaccinated: false,
        notes: "Passando por avaliação veterinária.",
        createdAt: "Ontem, 17:15",
    },
];
