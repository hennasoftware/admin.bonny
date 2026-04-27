import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
    type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import type { AnimalFormState, AnimalRecord, AnimalStatus } from "../types/types";

const animalsCollection = collection(db, "animals");

export function subscribeAnimals(
    onData: (animals: AnimalRecord[]) => void,
    onError?: (error: Error) => void,
): Unsubscribe {
    const animalQuery = query(animalsCollection, orderBy("createdAt", "desc"));

    return onSnapshot(
        animalQuery,
        (snapshot) => {
            onData(
                snapshot.docs.map((entry) => ({
                    id: entry.id,
                    ...(entry.data() as Omit<AnimalRecord, "id">),
                })),
            );
        },
        (error) => {
            onError?.(error as Error);
        },
    );
}

export async function createAnimal(values: AnimalFormState) {
    const now = new Date().toISOString();

    await addDoc(animalsCollection, {
        ...values,
        createdAt: now,
        updatedAt: now,
    });
}

export async function updateAnimal(animalId: string, values: AnimalFormState) {
    const now = new Date().toISOString();

    await updateDoc(doc(db, "animals", animalId), {
        ...values,
        updatedAt: now,
    });
}

export async function removeAnimal(animalId: string) {
    await deleteDoc(doc(db, "animals", animalId));
}

export function toAnimalFormState(animal: AnimalRecord): AnimalFormState {
    return {
        name: animal.name,
        species: animal.species,
        breed: animal.breed,
        sex: animal.sex,
        age: animal.age,
        size: animal.size,
        color: animal.color,
        status: animal.status,
        neutered: animal.neutered,
        vaccinated: animal.vaccinated,
        notes: animal.notes ?? "",
    };
}

export function matchesSearch(animal: AnimalRecord, search: string) {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return true;

    return [
        animal.name,
        animal.species,
        animal.breed,
        animal.color,
        animal.age,
        animal.status,
    ].some((value) => value.toLowerCase().includes(normalizedSearch));
}

export function matchesStatus(animal: AnimalRecord, status: AnimalStatus | "Todos") {
    return status === "Todos" ? true : animal.status === status;
}
