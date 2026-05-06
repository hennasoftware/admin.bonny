"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAdoptionDelete = exports.onAdoptionUpdate = exports.onAdoptionCreate = exports.onAdopterDelete = exports.onAdopterUpdate = exports.onAdopterCreate = exports.onAnimalDelete = exports.onAnimalUpdate = exports.onAnimalCreate = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
admin.initializeApp();
const db = admin.firestore();
const SUMMARY_DOCUMENT = "dashboard_summary/current";
function getMonthKeyFromDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}
function toDateSafe(value) {
    if (!value)
        return null;
    if (value instanceof admin.firestore.Timestamp)
        return value.toDate();
    if (value instanceof Date)
        return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}
function normalizeAdoptionStatus(status) {
    if (!status)
        return "Em analise";
    const normalized = String(status).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    if (normalized.includes("conclu"))
        return "Concluida";
    if (normalized.includes("agend"))
        return "Agendada";
    return "Em analise";
}
function normalizeAnimalStatus(status) {
    if (status === "Disponivel" || status === "Em processo" || status === "Adotado")
        return status;
    if (!status)
        return "Disponivel";
    const normalized = String(status).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    if (normalized.includes("process"))
        return "Em processo";
    if (normalized.includes("adot"))
        return "Adotado";
    return "Disponivel";
}
function normalizeAdopterStatus(status) {
    if (status === "Ativo" || status === "Inativo" || status === "Bloqueado")
        return status;
    if (!status)
        return "Inativo";
    const normalized = String(status).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    if (normalized.includes("ativo"))
        return "Ativo";
    if (normalized.includes("bloq"))
        return "Bloqueado";
    return "Inativo";
}
async function incrementMonthCounter(monthKey, field, delta) {
    await db.doc(`dashboard_monthly/${monthKey}`).set({
        [field]: admin.firestore.FieldValue.increment(delta),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
}
async function updateSummary(counters) {
    const payload = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    for (const [field, delta] of Object.entries(counters)) {
        if (delta !== 0) {
            payload[field] = admin.firestore.FieldValue.increment(delta);
        }
    }
    await db.doc(SUMMARY_DOCUMENT).set(payload, { merge: true });
}
function buildAnimalSummaryDelta(status, factor) {
    return {
        animalsTotal: factor,
        animalsAvailable: status === "Disponivel" ? factor : 0,
        animalsInProcess: status === "Em processo" ? factor : 0,
    };
}
function buildAdopterSummaryDelta(status, factor) {
    return {
        adoptersActive: status === "Ativo" ? factor : 0,
    };
}
function buildAdoptionSummaryDelta(status, factor) {
    return {
        adoptionsOpen: status === "Concluida" ? 0 : factor,
        adoptionsCompletedTotal: status === "Concluida" ? factor : 0,
    };
}
async function applyAnimalCreate(data) {
    const createdAt = toDateSafe(data?.createdAt) ?? new Date();
    const status = normalizeAnimalStatus(data?.status);
    await Promise.all([
        incrementMonthCounter(getMonthKeyFromDate(createdAt), "animals", 1),
        updateSummary(buildAnimalSummaryDelta(status, 1)),
    ]);
}
async function applyAnimalDelete(data) {
    const createdAt = toDateSafe(data?.createdAt) ?? new Date();
    const status = normalizeAnimalStatus(data?.status);
    await Promise.all([
        incrementMonthCounter(getMonthKeyFromDate(createdAt), "animals", -1),
        updateSummary(buildAnimalSummaryDelta(status, -1)),
    ]);
}
async function applyAnimalUpdate(before, after) {
    const beforeStatus = normalizeAnimalStatus(before?.status);
    const afterStatus = normalizeAnimalStatus(after?.status);
    if (beforeStatus === afterStatus)
        return;
    await updateSummary({
        animalsAvailable: (afterStatus === "Disponivel" ? 1 : 0) - (beforeStatus === "Disponivel" ? 1 : 0),
        animalsInProcess: (afterStatus === "Em processo" ? 1 : 0) - (beforeStatus === "Em processo" ? 1 : 0),
    });
}
async function applyAdopterCreate(data) {
    const createdAt = toDateSafe(data?.createdAt) ?? new Date();
    const status = normalizeAdopterStatus(data?.status);
    await Promise.all([
        incrementMonthCounter(getMonthKeyFromDate(createdAt), "adopters", 1),
        updateSummary(buildAdopterSummaryDelta(status, 1)),
    ]);
}
async function applyAdopterDelete(data) {
    const createdAt = toDateSafe(data?.createdAt) ?? new Date();
    const status = normalizeAdopterStatus(data?.status);
    await Promise.all([
        incrementMonthCounter(getMonthKeyFromDate(createdAt), "adopters", -1),
        updateSummary(buildAdopterSummaryDelta(status, -1)),
    ]);
}
async function applyAdopterUpdate(before, after) {
    const beforeStatus = normalizeAdopterStatus(before?.status);
    const afterStatus = normalizeAdopterStatus(after?.status);
    if (beforeStatus === afterStatus)
        return;
    await updateSummary({
        adoptersActive: (afterStatus === "Ativo" ? 1 : 0) - (beforeStatus === "Ativo" ? 1 : 0),
    });
}
async function applyAdoptionCreate(data) {
    const createdAt = toDateSafe(data?.createdAt) ?? new Date();
    const monthKey = getMonthKeyFromDate(createdAt);
    const status = normalizeAdoptionStatus(data?.status);
    const tasks = [updateSummary(buildAdoptionSummaryDelta(status, 1))];
    if (status === "Concluida") {
        tasks.push(incrementMonthCounter(monthKey, "adoptions", 1));
    }
    await Promise.all(tasks);
}
async function applyAdoptionDelete(data) {
    const createdAt = toDateSafe(data?.createdAt) ?? new Date();
    const monthKey = getMonthKeyFromDate(createdAt);
    const status = normalizeAdoptionStatus(data?.status);
    const tasks = [updateSummary(buildAdoptionSummaryDelta(status, -1))];
    if (status === "Concluida") {
        tasks.push(incrementMonthCounter(monthKey, "adoptions", -1));
    }
    await Promise.all(tasks);
}
async function applyAdoptionUpdate(before, after) {
    const beforeStatus = normalizeAdoptionStatus(before?.status);
    const afterStatus = normalizeAdoptionStatus(after?.status);
    if (beforeStatus === afterStatus)
        return;
    const monthKey = getMonthKeyFromDate(toDateSafe(after?.createdAt ?? before?.createdAt) ?? new Date());
    const tasks = [
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
exports.onAnimalCreate = functions.firestore.document("animals/{animalId}").onCreate(async (snapshot) => {
    await applyAnimalCreate(snapshot.data());
});
exports.onAnimalUpdate = functions.firestore.document("animals/{animalId}").onUpdate(async (change) => {
    await applyAnimalUpdate(change.before.data(), change.after.data());
});
exports.onAnimalDelete = functions.firestore.document("animals/{animalId}").onDelete(async (snapshot) => {
    await applyAnimalDelete(snapshot.data());
});
exports.onAdopterCreate = functions.firestore.document("adopters/{adopterId}").onCreate(async (snapshot) => {
    await applyAdopterCreate(snapshot.data());
});
exports.onAdopterUpdate = functions.firestore.document("adopters/{adopterId}").onUpdate(async (change) => {
    await applyAdopterUpdate(change.before.data(), change.after.data());
});
exports.onAdopterDelete = functions.firestore.document("adopters/{adopterId}").onDelete(async (snapshot) => {
    await applyAdopterDelete(snapshot.data());
});
exports.onAdoptionCreate = functions.firestore.document("adoptions/{adoptionId}").onCreate(async (snapshot) => {
    await applyAdoptionCreate(snapshot.data());
});
exports.onAdoptionUpdate = functions.firestore.document("adoptions/{adoptionId}").onUpdate(async (change) => {
    await applyAdoptionUpdate(change.before.data(), change.after.data());
});
exports.onAdoptionDelete = functions.firestore.document("adoptions/{adoptionId}").onDelete(async (snapshot) => {
    await applyAdoptionDelete(snapshot.data());
});
