import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    where,
} from "firebase/firestore";
import { getUserProfile } from "@/modules/auth/services/userProfiles";
import { createSystemLog } from "@/modules/logs/service";
import { auth, db } from "@/services/firebase";
import { subscribeCollection } from "@/shared/services/firestoreRealtime";
import { buildPagedConstraints, getCollectionPage } from "@/shared/utils/pagination";
import type { AdopterStatus } from "@/modules/adopters/types";
import type { AnimalStatus } from "@/modules/animals/types/types";
import type { AppDateValue } from "@/shared/utils/date";

export type AdoptionStatus = "Em analise" | "Agendada" | "Concluida";

export interface AdoptionRecord {
    id: string;
    adopterId: string;
    adopterName: string;
    animalId: string;
    animalName: string;
    animalCode?: string;
    status: AdoptionStatus;
    notes?: string;
    createdAt: AppDateValue;
    updatedAt?: AppDateValue;
}

interface CreateAdoptionPayload {
    adopterId: string;
    adopterName: string;
    animalId: string;
    animalName: string;
    animalCode?: string;
    status: AdoptionStatus;
    notes?: string;
}

const COLLECTION = "adoptions";

function mapAdoption(entry: { id: string; data: () => unknown }): AdoptionRecord {
    return {
        id: entry.id,
        ...(entry.data() as Omit<AdoptionRecord, "id">),
    };
}

export function subscribeAdoptions(
    onNext: (items: AdoptionRecord[]) => void,
    onError?: (err: Error) => void,
    status?: AdoptionStatus | "Todos",
) {
    return subscribeCollection<AdoptionRecord>(COLLECTION, onNext, {
        constraints: buildPagedConstraints(status),
        onError,
    });
}

export async function getAdoptionsPage(pageSize: number, cursor?: unknown, status?: AdoptionStatus | "Todos") {
    return getCollectionPage(
        {
            collectionName: COLLECTION,
            pageSize,
            cursor: cursor as never,
            filters: buildPagedConstraints(status),
        },
        mapAdoption,
    );
}

export async function getAdoptionsByStatus(status?: AdoptionStatus | "Todos") {
    const filters = status && status !== "Todos" ? [where("status", "==", status), orderBy("createdAt", "desc")] : [orderBy("createdAt", "desc")];
    const snapshot = await getDocs(query(collection(db, COLLECTION), ...filters));

    return snapshot.docs.map(mapAdoption);
}

export async function createAdoption(payload: CreateAdoptionPayload) {
    let createdAdoptionId = "";

    await runTransaction(db, async (transaction) => {
        const animalRef = doc(db, "animals", payload.animalId);
        const adopterRef = doc(db, "adopters", payload.adopterId);
        const adoptionRef = doc(collection(db, COLLECTION));
        createdAdoptionId = adoptionRef.id;

        const [animalSnap, adopterSnap] = await Promise.all([transaction.get(animalRef), transaction.get(adopterRef)]);

        if (!animalSnap.exists()) {
            throw new Error("Animal nao encontrado.");
        }

        if (!adopterSnap.exists()) {
            throw new Error("Adotante nao encontrado.");
        }

        const animal = animalSnap.data() as { status?: AnimalStatus };
        const adopter = adopterSnap.data() as { status?: AdopterStatus };

        if (animal.status !== "Disponivel") {
            throw new Error("O animal selecionado nao esta disponivel para adocao.");
        }

        if (adopter.status !== "Ativo") {
            throw new Error("Apenas adotantes ativos podem iniciar uma adocao.");
        }

        transaction.set(adoptionRef, {
            adopterId: payload.adopterId,
            adopterName: payload.adopterName,
            animalId: payload.animalId,
            animalName: payload.animalName,
            animalCode: payload.animalCode ?? "",
            status: payload.status,
            notes: payload.notes ?? "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        transaction.update(animalRef, {
            status: getAnimalStatusForAdoptionStatus(payload.status),
            updatedAt: serverTimestamp(),
        });
    });

    const currentUser = auth.currentUser;
    if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
            await createSystemLog(profile, {
                action: "create",
                module: "adoptions",
                targetId: createdAdoptionId,
                description: `Registrou a adocao de ${payload.animalName} para ${payload.adopterName}.`,
            });
        }
    }

    return createdAdoptionId;
}

export async function updateAdoptionStatus(adoptionId: string, nextStatus: AdoptionStatus): Promise<void> {
    const adoptionSnapshot = await getDoc(doc(db, COLLECTION, adoptionId));

    await runTransaction(db, async (transaction) => {
        const adoptionRef = doc(db, COLLECTION, adoptionId);
        const adoptionSnap = await transaction.get(adoptionRef);

        if (!adoptionSnap.exists()) {
            throw new Error("Adocao nao encontrada.");
        }

        const adoption = adoptionSnap.data() as AdoptionRecord;
        const animalRef = doc(db, "animals", adoption.animalId);

        transaction.update(adoptionRef, {
            status: nextStatus,
            updatedAt: serverTimestamp(),
        });

        transaction.update(animalRef, {
            status: getAnimalStatusForAdoptionStatus(nextStatus),
            updatedAt: serverTimestamp(),
        });
    });

    const currentUser = auth.currentUser;
    const adoptionData = adoptionSnapshot.data() as AdoptionRecord | undefined;
    if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        if (profile && adoptionData) {
            await createSystemLog(profile, {
                action: "update",
                module: "adoptions",
                targetId: adoptionId,
                description: `Atualizou a adocao de ${adoptionData.animalName} para ${adoptionData.adopterName} com status ${nextStatus}.`,
            });
        }
    }
}

export async function removeAdoption(adoptionId: string): Promise<void> {
    const adoptionRef = doc(db, COLLECTION, adoptionId);
    const adoptionSnap = await getDoc(adoptionRef);

    if (!adoptionSnap.exists()) {
        throw new Error("Adocao nao encontrada.");
    }

    const adoption = adoptionSnap.data() as AdoptionRecord;

    if (adoption.status === "Concluida") {
        throw new Error("Adocoes concluidas nao podem ser excluidas.");
    }

    const relatedSnapshot = await getDocs(query(collection(db, COLLECTION), where("animalId", "==", adoption.animalId)));
    const remainingAdoptions = relatedSnapshot.docs
        .map((entry) => ({ id: entry.id, ...(entry.data() as Omit<AdoptionRecord, "id">) }))
        .filter((entry) => entry.id !== adoptionId);

    await runTransaction(db, async (transaction) => {
        const currentAdoptionSnap = await transaction.get(adoptionRef);

        if (!currentAdoptionSnap.exists()) {
            throw new Error("Adocao nao encontrada.");
        }

        transaction.delete(adoptionRef);
        transaction.update(doc(db, "animals", adoption.animalId), {
            status: getAnimalStatusFromAdoptions(remainingAdoptions),
            updatedAt: serverTimestamp(),
        });
    });

    const currentUser = auth.currentUser;
    if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
            await createSystemLog(profile, {
                action: "delete",
                module: "adoptions",
                targetId: adoptionId,
                description: `Excluiu a adocao de ${adoption.animalName} para ${adoption.adopterName}.`,
            });
        }
    }
}

export function getAnimalStatusForAdoptionStatus(status: AdoptionStatus): AnimalStatus {
    return status === "Concluida" ? "Adotado" : "Em processo";
}

export function getAnimalStatusFromAdoptions(adoptions: Array<Pick<AdoptionRecord, "status">>): AnimalStatus {
    if (adoptions.some((adoption) => adoption.status === "Concluida")) {
        return "Adotado";
    }

    if (adoptions.some((adoption) => adoption.status === "Agendada" || adoption.status === "Em analise")) {
        return "Em processo";
    }

    return "Disponivel";
}
