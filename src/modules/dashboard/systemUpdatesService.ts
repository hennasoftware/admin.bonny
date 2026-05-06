import { orderBy } from "firebase/firestore";
import { subscribeCollection } from "@/shared/services/firestoreRealtime";
import type { SystemUpdateEntry } from "./systemUpdates";

const SYSTEM_UPDATES_COLLECTION = "system_updates";

export function subscribeSystemUpdates(
    onData: (updates: SystemUpdateEntry[]) => void,
    onError?: (error: Error) => void,
) {
    return subscribeCollection<SystemUpdateEntry>(SYSTEM_UPDATES_COLLECTION, onData, {
        constraints: [orderBy("publishedAt", "desc")],
        onError,
    });
}
