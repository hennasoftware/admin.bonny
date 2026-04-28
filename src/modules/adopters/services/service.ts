import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import type { AdopterFormState, AdopterRecord } from "../types";

const COLLECTION_NAME = "adopters";

export function subscribeAdopters(
    onNext: (adopters: AdopterRecord[]) => void,
    onError: (error: Error) => void
) {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));

    return onSnapshot(
        q,
        (snapshot) => {
            const adopters = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as AdopterRecord[];

            onNext(adopters);
        },
        onError
    );
}

export async function createAdopter(values: AdopterFormState): Promise<void> {
    await addDoc(collection(db, COLLECTION_NAME), {
        ...values,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function updateAdopter(adopterId: string, values: AdopterFormState): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, adopterId);
    await updateDoc(docRef, {
        ...values,
        updatedAt: serverTimestamp(),
    });
}

export async function removeAdopter(adopterId: string): Promise<void> {
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
