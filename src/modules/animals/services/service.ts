import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { buildPagedConstraints, getCollectionPage } from "@/shared/utils/pagination";
import type { AnimalFormState, AnimalRecord, AnimalStatus } from "../types/types";

const COLLECTION_NAME = "animals";
const animalsCollection = collection(db, COLLECTION_NAME);

function mapAnimal(entry: { id: string; data: () => unknown }): AnimalRecord {
    return {
        id: entry.id,
        ...(entry.data() as Omit<AnimalRecord, "id">),
    };
}

export function subscribeAnimals(
    onData: (animals: AnimalRecord[]) => void,
    onError?: (error: Error) => void,
    status?: AnimalRecord["status"] | "Todos",
): Unsubscribe {
    const constraints = status && status !== "Todos" ? buildPagedConstraints(status) : [orderBy("createdAt", "desc")];
    const animalQuery = query(animalsCollection, ...constraints);

    return onSnapshot(
        animalQuery,
        (snapshot) => onData(snapshot.docs.map(mapAnimal)),
        (error) => onError?.(error as Error),
    );
}

export async function getAnimalsPage(pageSize: number, cursor?: unknown, status?: AnimalStatus | "Todos") {
    return getCollectionPage(
        {
            collectionName: COLLECTION_NAME,
            pageSize,
            cursor: cursor as never,
            filters: buildPagedConstraints(status),
        },
        mapAnimal,
    );
}

export async function getAnimalsByStatus(status?: AnimalStatus | "Todos") {
    const filters = status && status !== "Todos" ? [where("status", "==", status), orderBy("createdAt", "desc")] : [orderBy("createdAt", "desc")];
    const snapshot = await getDocs(query(animalsCollection, ...filters));
    return snapshot.docs.map(mapAnimal);
}

export async function createAnimal(values: AnimalFormState) {
    await addDoc(animalsCollection, {
        ...values,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function updateAnimal(animalId: string, values: AnimalFormState) {
    await updateDoc(doc(db, COLLECTION_NAME, animalId), {
        ...values,
        updatedAt: serverTimestamp(),
    });
}

export async function removeAnimal(animalId: string) {
    const relatedAdoptions = await getDocs(query(collection(db, "adoptions"), where("animalId", "==", animalId)));

    if (!relatedAdoptions.empty) {
        throw new Error("Nao e possivel excluir um animal com adocoes vinculadas.");
    }

    await deleteDoc(doc(db, COLLECTION_NAME, animalId));
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

    return [animal.name, animal.species, animal.breed, animal.color, animal.age, animal.status].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
    );
}

// matchesStatus removed — status checks are handled inline where needed
