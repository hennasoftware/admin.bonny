import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { subscribeCollection } from "@/shared/services/firestoreRealtime";
import { buildPagedConstraints, getCollectionPage } from "@/shared/utils/pagination";
import type { AnimalFormState, AnimalRecord, AnimalStatus } from "../types/types";
import { formatAnimalCode } from "../utils/code";
import { formatAnimalAgeInput } from "../utils/age";

const COLLECTION_NAME = "animals";
const animalsCollection = collection(db, COLLECTION_NAME);
const animalCounterRef = doc(db, "system_counters", "animals");

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
){
    const constraints = status && status !== "Todos" ? buildPagedConstraints(status) : [orderBy("createdAt", "desc")];
    return subscribeCollection<AnimalRecord>(COLLECTION_NAME, onData, { constraints, onError });
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

export async function getAnimalById(animalId: string) {
    const snapshot = await getDoc(doc(db, COLLECTION_NAME, animalId));
    if (!snapshot.exists()) return null;

    return mapAnimal(snapshot);
}

export async function createAnimal(values: AnimalFormState) {
    let generatedAnimalCode = "";

    await runTransaction(db, async (transaction) => {
        const animalRef = doc(animalsCollection);
        const counterSnap = await transaction.get(animalCounterRef);
        const currentValue = Number((counterSnap.data() as { currentValue?: unknown } | undefined)?.currentValue) || 0;
        const nextValue = currentValue + 1;
        generatedAnimalCode = formatAnimalCode(nextValue);

        transaction.set(
            animalCounterRef,
            {
                currentValue: nextValue,
                updatedAt: serverTimestamp(),
            },
            { merge: true },
        );

        transaction.set(animalRef, {
            ...values,
            animalCode: generatedAnimalCode,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    });

    return generatedAnimalCode;
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
        age: formatAnimalAgeInput(animal.age),
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

    return [animal.animalCode ?? "", animal.id, animal.name, animal.species, animal.breed, animal.color, animal.age, animal.status].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
    );
}

// matchesStatus removed — status checks are handled inline where needed
