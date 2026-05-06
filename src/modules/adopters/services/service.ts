import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { subscribeCollection } from "@/shared/services/firestoreRealtime";
import { buildPagedConstraints, getCollectionPage } from "@/shared/utils/pagination";
import type { AdopterFormState, AdopterRecord, AdopterStatus } from "../types";

const COLLECTION_NAME = "adopters";

function mapAdopter(entry: { id: string; data: () => unknown }): AdopterRecord {
    return {
        id: entry.id,
        ...(entry.data() as Omit<AdopterRecord, "id">),
    };
}

export function subscribeAdopters(onNext: (adopters: AdopterRecord[]) => void, onError?: (error: Error) => void) {
    return subscribeCollection<AdopterRecord>(COLLECTION_NAME, onNext, {
        constraints: [orderBy("createdAt", "desc")],
        onError,
    });
}

export async function getAdoptersPage(pageSize: number, cursor?: unknown, status?: AdopterStatus | "Todos") {
    return getCollectionPage(
        {
            collectionName: COLLECTION_NAME,
            pageSize,
            cursor: cursor as never,
            filters: buildPagedConstraints(status),
        },
        mapAdopter,
    );
}

export async function getAdoptersByStatus(status?: AdopterStatus | "Todos") {
    const filters = status && status !== "Todos" ? [where("status", "==", status), orderBy("createdAt", "desc")] : [orderBy("createdAt", "desc")];
    const snapshot = await getDocs(query(collection(db, COLLECTION_NAME), ...filters));
    return snapshot.docs.map(mapAdopter);
}

export async function getAdopterById(adopterId: string) {
    const snapshot = await getDoc(doc(db, COLLECTION_NAME, adopterId));
    if (!snapshot.exists()) return null;

    return mapAdopter(snapshot);
}

export async function createAdopter(values: AdopterFormState): Promise<void> {
    await addDoc(collection(db, COLLECTION_NAME), {
        ...values,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function updateAdopter(adopterId: string, values: AdopterFormState): Promise<void> {
    await updateDoc(doc(db, COLLECTION_NAME, adopterId), {
        ...values,
        updatedAt: serverTimestamp(),
    });
}

export async function removeAdopter(adopterId: string): Promise<void> {
    const relatedAdoptions = await getDocs(query(collection(db, "adoptions"), where("adopterId", "==", adopterId)));

    if (!relatedAdoptions.empty) {
        throw new Error("Nao e possivel excluir um adotante com adocoes vinculadas.");
    }

    await deleteDoc(doc(db, COLLECTION_NAME, adopterId));
}

export function matchesSearch(adopter: AdopterRecord, search: string): boolean {
    if (!search.trim()) return true;

    const searchLower = search.toLowerCase();
    return (
        adopter.name.toLowerCase().includes(searchLower) ||
        adopter.email.toLowerCase().includes(searchLower) ||
        adopter.phone.includes(search) ||
        adopter.cpf.includes(search)
    );
}

export function matchesStatus(adopter: AdopterRecord, status: string): boolean {
    if (status === "Todos") return true;
    return adopter.status === status;
}
