import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "@/services/firebase";
import { SYSTEM_UPDATES_SEED } from "./systemUpdatesSeedData";

export async function seedSystemUpdatesWithWebSdk() {
    const batch = writeBatch(db);

    for (const update of SYSTEM_UPDATES_SEED) {
        const { id, ...payload } = update;
        batch.set(
            doc(db, "system_updates", id),
            {
                ...payload,
                updatedAt: serverTimestamp(),
            },
            { merge: true },
        );
    }

    await batch.commit();

    return SYSTEM_UPDATES_SEED.length;
}
