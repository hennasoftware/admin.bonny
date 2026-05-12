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

interface DuplicateAdopterConflict {
    field: "cpf" | "phone" | "email";
    adopter: AdopterRecord;
}

function normalizeDigits(value: string) {
    return value.replace(/\D/g, "");
}

function normalizeEmail(value: string) {
    return value.trim().toLowerCase();
}

function buildAdopterPayload(values: AdopterFormState) {
    return {
        ...values,
        emailNormalized: normalizeEmail(values.email),
        cpfDigits: normalizeDigits(values.cpf),
        phoneDigits: normalizeDigits(values.phone),
    };
}

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

export async function findDuplicateAdopter(values: AdopterFormState, currentAdopterId?: string): Promise<DuplicateAdopterConflict | null> {
    const adopters = await getAdoptersByStatus("Todos");
    const emailNormalized = normalizeEmail(values.email);
    const cpfDigits = normalizeDigits(values.cpf);
    const phoneDigits = normalizeDigits(values.phone);

    const conflictingByEmail = adopters.find((adopter) => adopter.id !== currentAdopterId && normalizeEmail(adopter.email) === emailNormalized);
    if (conflictingByEmail) {
        return { field: "email", adopter: conflictingByEmail };
    }

    const conflictingByCpf = adopters.find((adopter) => adopter.id !== currentAdopterId && normalizeDigits(adopter.cpf) === cpfDigits);
    if (conflictingByCpf) {
        return { field: "cpf", adopter: conflictingByCpf };
    }

    const conflictingByPhone = adopters.find((adopter) => adopter.id !== currentAdopterId && normalizeDigits(adopter.phone) === phoneDigits);
    if (conflictingByPhone) {
        return { field: "phone", adopter: conflictingByPhone };
    }

    return null;
}

export async function createAdopter(values: AdopterFormState): Promise<void> {
    const duplicate = await findDuplicateAdopter(values);

    if (duplicate) {
        throw new Error(
            duplicate.field === "email"
                ? `Ja existe um adotante com este email: ${duplicate.adopter.name}.`
                : duplicate.field === "cpf"
                  ? `Ja existe um adotante com este CPF: ${duplicate.adopter.name}.`
                  : `Ja existe um adotante com este telefone: ${duplicate.adopter.name}.`,
        );
    }

    await addDoc(collection(db, COLLECTION_NAME), {
        ...buildAdopterPayload(values),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function updateAdopter(adopterId: string, values: AdopterFormState): Promise<void> {
    const duplicate = await findDuplicateAdopter(values, adopterId);

    if (duplicate) {
        throw new Error(
            duplicate.field === "email"
                ? `Ja existe outro adotante com este email: ${duplicate.adopter.name}.`
                : duplicate.field === "cpf"
                  ? `Ja existe outro adotante com este CPF: ${duplicate.adopter.name}.`
                  : `Ja existe outro adotante com este telefone: ${duplicate.adopter.name}.`,
        );
    }

    await updateDoc(doc(db, COLLECTION_NAME, adopterId), {
        ...buildAdopterPayload(values),
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
