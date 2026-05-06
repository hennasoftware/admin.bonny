import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();

const db = admin.firestore();
const SUMMARY_DOCUMENT = "dashboard_summary/current";

type AnimalStatus = "Disponivel" | "Em processo" | "Adotado";
type AdopterStatus = "Ativo" | "Inativo" | "Bloqueado";
type AdoptionStatus = "Em analise" | "Agendada" | "Concluida";

interface AnimalDocument {
    createdAt?: admin.firestore.Timestamp | Date | string | null;
    status?: AnimalStatus | string | null;
}

interface AdopterDocument {
    createdAt?: admin.firestore.Timestamp | Date | string | null;
    status?: AdopterStatus | string | null;
}

interface AdoptionDocument {
    createdAt?: admin.firestore.Timestamp | Date | string | null;
    status?: AdoptionStatus | string | null;
}

function getMonthKeyFromDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

function toDateSafe(value: admin.firestore.Timestamp | Date | string | null | undefined): Date | null {
    if (!value) return null;
    if (value instanceof admin.firestore.Timestamp) return value.toDate();
    if (value instanceof Date) return value;

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeAdoptionStatus(status: AdoptionStatus | string | null | undefined): AdoptionStatus {
    if (!status) return "Em analise";

    const normalized = String(status).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

    if (normalized.includes("conclu")) return "Concluida";
    if (normalized.includes("agend")) return "Agendada";
    return "Em analise";
}

function normalizeAnimalStatus(status: AnimalStatus | string | null | undefined): AnimalStatus {
    if (status === "Disponivel" || status === "Em processo" || status === "Adotado") return status;
    if (!status) return "Disponivel";

    const normalized = String(status).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

    if (normalized.includes("process")) return "Em processo";
    if (normalized.includes("adot")) return "Adotado";
    return "Disponivel";
}

function normalizeAdopterStatus(status: AdopterStatus | string | null | undefined): AdopterStatus {
    if (status === "Ativo" || status === "Inativo" || status === "Bloqueado") return status;
    if (!status) return "Inativo";

    const normalized = String(status).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

    if (normalized.includes("ativo")) return "Ativo";
    if (normalized.includes("bloq")) return "Bloqueado";
    return "Inativo";
}

async function incrementMonthCounter(monthKey: string, field: string, delta: number) {
    await db.doc(`dashboard_monthly/${monthKey}`).set(
        {
            [field]: admin.firestore.FieldValue.increment(delta),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
    );
}

async function updateSummary(counters: Record<string, number>) {
    const payload: Record<string, admin.firestore.FieldValue> = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    for (const [field, delta] of Object.entries(counters)) {
        if (delta !== 0) {
            payload[field] = admin.firestore.FieldValue.increment(delta);
        }
    }

    await db.doc(SUMMARY_DOCUMENT).set(payload, { merge: true });
}

function buildAnimalSummaryDelta(status: AnimalStatus, factor: 1 | -1) {
    return {
        animalsTotal: factor,
        animalsAvailable: status === "Disponivel" ? factor : 0,
        animalsInProcess: status === "Em processo" ? factor : 0,
    };
}

function buildAdopterSummaryDelta(status: AdopterStatus, factor: 1 | -1) {
    return {
        adoptersActive: status === "Ativo" ? factor : 0,
    };
}

function buildAdoptionSummaryDelta(status: AdoptionStatus, factor: 1 | -1) {
    return {
        adoptionsOpen: status === "Concluida" ? 0 : factor,
        adoptionsCompletedTotal: status === "Concluida" ? factor : 0,
    };
}

async function applyAnimalCreate(data: AnimalDocument | undefined) {
    const createdAt = toDateSafe(data?.createdAt) ?? new Date();
    const status = normalizeAnimalStatus(data?.status);

    await Promise.all([
        incrementMonthCounter(getMonthKeyFromDate(createdAt), "animals", 1),
        updateSummary(buildAnimalSummaryDelta(status, 1)),
    ]);
}

async function applyAnimalDelete(data: AnimalDocument | undefined) {
    const createdAt = toDateSafe(data?.createdAt) ?? new Date();
    const status = normalizeAnimalStatus(data?.status);

    await Promise.all([
        incrementMonthCounter(getMonthKeyFromDate(createdAt), "animals", -1),
        updateSummary(buildAnimalSummaryDelta(status, -1)),
    ]);
}

async function applyAnimalUpdate(before: AnimalDocument | undefined, after: AnimalDocument | undefined) {
    const beforeStatus = normalizeAnimalStatus(before?.status);
    const afterStatus = normalizeAnimalStatus(after?.status);

    if (beforeStatus === afterStatus) return;

    await updateSummary({
        animalsAvailable: (afterStatus === "Disponivel" ? 1 : 0) - (beforeStatus === "Disponivel" ? 1 : 0),
        animalsInProcess: (afterStatus === "Em processo" ? 1 : 0) - (beforeStatus === "Em processo" ? 1 : 0),
    });
}

async function applyAdopterCreate(data: AdopterDocument | undefined) {
    const createdAt = toDateSafe(data?.createdAt) ?? new Date();
    const status = normalizeAdopterStatus(data?.status);

    await Promise.all([
        incrementMonthCounter(getMonthKeyFromDate(createdAt), "adopters", 1),
        updateSummary(buildAdopterSummaryDelta(status, 1)),
    ]);
}

async function applyAdopterDelete(data: AdopterDocument | undefined) {
    const createdAt = toDateSafe(data?.createdAt) ?? new Date();
    const status = normalizeAdopterStatus(data?.status);

    await Promise.all([
        incrementMonthCounter(getMonthKeyFromDate(createdAt), "adopters", -1),
        updateSummary(buildAdopterSummaryDelta(status, -1)),
    ]);
}

async function applyAdopterUpdate(before: AdopterDocument | undefined, after: AdopterDocument | undefined) {
    const beforeStatus = normalizeAdopterStatus(before?.status);
    const afterStatus = normalizeAdopterStatus(after?.status);

    if (beforeStatus === afterStatus) return;

    await updateSummary({
        adoptersActive: (afterStatus === "Ativo" ? 1 : 0) - (beforeStatus === "Ativo" ? 1 : 0),
    });
}

async function applyAdoptionCreate(data: AdoptionDocument | undefined) {
    const createdAt = toDateSafe(data?.createdAt) ?? new Date();
    const monthKey = getMonthKeyFromDate(createdAt);
    const status = normalizeAdoptionStatus(data?.status);

    const tasks: Promise<unknown>[] = [updateSummary(buildAdoptionSummaryDelta(status, 1))];

    if (status === "Concluida") {
        tasks.push(incrementMonthCounter(monthKey, "adoptions", 1));
    }

    await Promise.all(tasks);
}

async function applyAdoptionDelete(data: AdoptionDocument | undefined) {
    const createdAt = toDateSafe(data?.createdAt) ?? new Date();
    const monthKey = getMonthKeyFromDate(createdAt);
    const status = normalizeAdoptionStatus(data?.status);

    const tasks: Promise<unknown>[] = [updateSummary(buildAdoptionSummaryDelta(status, -1))];

    if (status === "Concluida") {
        tasks.push(incrementMonthCounter(monthKey, "adoptions", -1));
    }

    await Promise.all(tasks);
}

async function applyAdoptionUpdate(before: AdoptionDocument | undefined, after: AdoptionDocument | undefined) {
    const beforeStatus = normalizeAdoptionStatus(before?.status);
    const afterStatus = normalizeAdoptionStatus(after?.status);

    if (beforeStatus === afterStatus) return;

    const monthKey = getMonthKeyFromDate(toDateSafe(after?.createdAt ?? before?.createdAt) ?? new Date());
    const tasks: Promise<unknown>[] = [
        updateSummary({
            adoptionsOpen: (afterStatus === "Concluida" ? 0 : 1) - (beforeStatus === "Concluida" ? 0 : 1),
            adoptionsCompletedTotal: (afterStatus === "Concluida" ? 1 : 0) - (beforeStatus === "Concluida" ? 1 : 0),
        }),
    ];

    if (beforeStatus !== "Concluida" && afterStatus === "Concluida") {
        tasks.push(incrementMonthCounter(monthKey, "adoptions", 1));
    }

    if (beforeStatus === "Concluida" && afterStatus !== "Concluida") {
        tasks.push(incrementMonthCounter(monthKey, "adoptions", -1));
    }

    await Promise.all(tasks);
}

export const onAnimalCreate = functions.firestore.document("animals/{animalId}").onCreate(async (snapshot) => {
    await applyAnimalCreate(snapshot.data() as AnimalDocument | undefined);
});

export const onAnimalUpdate = functions.firestore.document("animals/{animalId}").onUpdate(async (change) => {
    await applyAnimalUpdate(change.before.data() as AnimalDocument | undefined, change.after.data() as AnimalDocument | undefined);
});

export const onAnimalDelete = functions.firestore.document("animals/{animalId}").onDelete(async (snapshot) => {
    await applyAnimalDelete(snapshot.data() as AnimalDocument | undefined);
});

export const onAdopterCreate = functions.firestore.document("adopters/{adopterId}").onCreate(async (snapshot) => {
    await applyAdopterCreate(snapshot.data() as AdopterDocument | undefined);
});

export const onAdopterUpdate = functions.firestore.document("adopters/{adopterId}").onUpdate(async (change) => {
    await applyAdopterUpdate(change.before.data() as AdopterDocument | undefined, change.after.data() as AdopterDocument | undefined);
});

export const onAdopterDelete = functions.firestore.document("adopters/{adopterId}").onDelete(async (snapshot) => {
    await applyAdopterDelete(snapshot.data() as AdopterDocument | undefined);
});

export const onAdoptionCreate = functions.firestore.document("adoptions/{adoptionId}").onCreate(async (snapshot) => {
    await applyAdoptionCreate(snapshot.data() as AdoptionDocument | undefined);
});

export const onAdoptionUpdate = functions.firestore.document("adoptions/{adoptionId}").onUpdate(async (change) => {
    await applyAdoptionUpdate(change.before.data() as AdoptionDocument | undefined, change.after.data() as AdoptionDocument | undefined);
});

export const onAdoptionDelete = functions.firestore.document("adoptions/{adoptionId}").onDelete(async (snapshot) => {
    await applyAdoptionDelete(snapshot.data() as AdoptionDocument | undefined);
});
