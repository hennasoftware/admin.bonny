/**
 * Backfill script for animalCode on legacy animals.
 *
 * Usage:
 * 1) With Firestore emulator:
 *    $env:FIRESTORE_EMULATOR_HOST = "localhost:8080"; node .\functions\backfill-animal-codes.js
 * 2) Against the real project:
 *    ensure admin credentials are available, then run:
 *    node .\functions\backfill-animal-codes.js
 */

const admin = require("firebase-admin");

admin.initializeApp({
    projectId: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "projetobonny-cf64e",
});

const db = admin.firestore();
const counterRef = db.collection("system_counters").doc("animals");

function formatAnimalCode(sequence) {
    return `A${String(sequence).padStart(4, "0")}`;
}

async function backfillAnimalCodes() {
    const counterSnap = await counterRef.get();
    let currentValue = Number(counterSnap.data()?.currentValue) || 0;

    const animalsSnap = await db.collection("animals").orderBy("createdAt", "asc").get();
    const legacyAnimals = animalsSnap.docs.filter((doc) => !doc.data().animalCode);

    if (legacyAnimals.length === 0) {
        console.log("No legacy animals found without animalCode.");
        return;
    }

    const batch = db.batch();

    for (const animalDoc of legacyAnimals) {
        currentValue += 1;
        const animalCode = formatAnimalCode(currentValue);

        batch.update(animalDoc.ref, {
            animalCode,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Prepared ${animalDoc.id} -> ${animalCode}`);
    }

    batch.set(
        counterRef,
        {
            currentValue,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
    );

    await batch.commit();
    console.log(`Backfill complete. Updated ${legacyAnimals.length} animals.`);
}

backfillAnimalCodes()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
