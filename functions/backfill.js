/**
 * Backfill script for dashboard/monthly aggregates.
 *
 * Usage (PowerShell):
 * 1) Start Firestore emulator (recommended):
 *    firebase emulators:start --only firestore
 * 2) In another terminal (PowerShell), set emulator host and run:
 *    $env:FIRESTORE_EMULATOR_HOST = "localhost:8080"; node .\functions\backfill.js
 *
 * If you run against a real project, make sure your environment is authenticated
 * (e.g., GOOGLE_APPLICATION_CREDENTIALS pointing to a service account JSON) and
 * remove the FIRESTORE_EMULATOR_HOST env var.
 */

const admin = require("firebase-admin");

// Initialize the Admin SDK. When using the emulator, set FIRESTORE_EMULATOR_HOST
// in the environment before running this script (see usage above).
admin.initializeApp();
const db = admin.firestore();

function getMonthKeyFromDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}

function toDateSafe(value) {
    if (!value) return null;
    if (value && typeof value.toDate === "function") return value.toDate();
    if (value instanceof Date) return value;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
}

function normalizeStatus(status) {
    if (!status) return "Em analise";
    const s = String(status).normalize("NFD").replace(/\p{Diacritic}/gu, "");
    if (s.toLowerCase().includes("conclu")) return "Concluida";
    if (s.toLowerCase().includes("agend")) return "Agendada";
    if (s.toLowerCase().includes("anal")) return "Em analise";
    return s;
}

function buildBuckets(months = 12) {
    const today = new Date();
    const buckets = [];
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        buckets.push(getMonthKeyFromDate(d));
    }
    return buckets;
}

async function countAndWrite() {
    const months = buildBuckets(12);
    const animalsMap = new Map(months.map((m) => [m, 0]));
    const adoptersMap = new Map(months.map((m) => [m, 0]));
    const adoptionsMap = new Map(months.map((m) => [m, 0]));
    let animalsTotal = 0;
    let animalsAvailable = 0;
    let animalsInProcess = 0;
    let adoptersActive = 0;
    let adoptionsOpen = 0;
    let adoptionsCompletedTotal = 0;

    console.log("Counting animals...");
    const animalsSnap = await db.collection("animals").get();
    animalsSnap.forEach((doc) => {
        const data = doc.data();
        animalsTotal += 1;
        if (data?.status === "Disponivel") animalsAvailable += 1;
        if (data?.status === "Em processo") animalsInProcess += 1;
        const date = toDateSafe(data?.createdAt);
        if (!date) return;
        const key = getMonthKeyFromDate(date);
        if (animalsMap.has(key)) animalsMap.set(key, animalsMap.get(key) + 1);
    });

    console.log("Counting adopters...");
    const adoptersSnap = await db.collection("adopters").get();
    adoptersSnap.forEach((doc) => {
        const data = doc.data();
        if (data?.status === "Ativo") adoptersActive += 1;
        const date = toDateSafe(data?.createdAt);
        if (!date) return;
        const key = getMonthKeyFromDate(date);
        if (adoptersMap.has(key)) adoptersMap.set(key, adoptersMap.get(key) + 1);
    });

    console.log("Counting completed adoptions...");
    const adoptionsSnap = await db.collection("adoptions").get();
    adoptionsSnap.forEach((doc) => {
        const data = doc.data();
        const status = normalizeStatus(data?.status);
        if (status === "Concluida") {
            adoptionsCompletedTotal += 1;
        } else {
            adoptionsOpen += 1;
        }
        if (status !== "Concluida") return;
        const date = toDateSafe(data?.createdAt);
        if (!date) return;
        const key = getMonthKeyFromDate(date);
        if (adoptionsMap.has(key)) adoptionsMap.set(key, adoptionsMap.get(key) + 1);
    });

    console.log("Writing aggregates to dashboard_monthly/* ...");
    for (const key of months) {
        const animals = animalsMap.get(key) || 0;
        const adopters = adoptersMap.get(key) || 0;
        const adoptions = adoptionsMap.get(key) || 0;

        const docRef = db.doc(`dashboard_monthly/${key}`);
        await docRef.set(
            {
                animals,
                adopters,
                adoptions,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
        );
        console.log(`Wrote ${key} -> animals:${animals} adopters:${adopters} adoptions:${adoptions}`);
    }

    console.log("Writing summary to dashboard_summary/current ...");
    await db.doc("dashboard_summary/current").set(
        {
            animalsAvailable,
            animalsInProcess,
            animalsTotal,
            adoptersActive,
            adoptionsCompletedTotal,
            adoptionsOpen,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
    );

    console.log("Backfill complete.");
}

countAndWrite()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

