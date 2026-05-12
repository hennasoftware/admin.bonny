import type { AnimalRecord } from "../types/types";

const ANIMAL_CODE_PREFIX = "A";

export function formatAnimalCode(sequence: number) {
    return `${ANIMAL_CODE_PREFIX}${String(sequence).padStart(4, "0")}`;
}

export function getAnimalCodeLabel(animal: Pick<AnimalRecord, "animalCode" | "id">) {
    if (animal.animalCode?.trim()) {
        return animal.animalCode.trim();
    }

    return `LEG-${animal.id.slice(0, 6).toUpperCase()}`;
}

export function hasGeneratedAnimalCode(animal: Pick<AnimalRecord, "animalCode">) {
    return Boolean(animal.animalCode?.trim());
}
