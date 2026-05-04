import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase";

export interface AdoptionRecord {
    id: string;
    adopterId: string;
    adopterName: string;
    animalId: string;
    animalName: string;
    notes?: string;
    createdAt: any;
}

const COLLECTION = "adoptions";

export function subscribeAdoptions(onNext: (items: AdoptionRecord[]) => void, onError?: (err: Error) => void) {
    const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));

    return onSnapshot(
        q,
        (snapshot) => {
            const items = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as AdoptionRecord[];
            onNext(items);
        },
        (err) => onError?.(err as Error),
    );
}

export async function createAdoption(payload: { adopterId: string; adopterName: string; animalId: string; animalName: string; notes?: string }) {
    // create adoption record
    await addDoc(collection(db, COLLECTION), {
        adopterId: payload.adopterId,
        adopterName: payload.adopterName,
        animalId: payload.animalId,
        animalName: payload.animalName,
        notes: payload.notes ?? "",
        createdAt: serverTimestamp(),
    });

    // mark animal as adopted
    const animalRef = doc(db, "animals", payload.animalId);
    await updateDoc(animalRef, {
        status: "Adotado",
        updatedAt: serverTimestamp(),
    });
}

export async function removeAdoption(adoptionId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, adoptionId));
}

