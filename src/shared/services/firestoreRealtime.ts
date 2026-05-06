import {
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    type DocumentData,
    type QueryConstraint,
    type QueryDocumentSnapshot,
    type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/services/firebase";

export function mapFirestoreDocument<T>(snapshot: QueryDocumentSnapshot<DocumentData>): T {
    return {
        id: snapshot.id,
        ...(snapshot.data() as Omit<T, "id">),
    } as T;
}

export function subscribeCollection<T>(
    collectionName: string,
    onData: (items: T[]) => void,
    options?: {
        constraints?: QueryConstraint[];
        onError?: (error: Error) => void;
    },
): Unsubscribe {
    const collectionQuery = query(collection(db, collectionName), ...(options?.constraints ?? [orderBy("createdAt", "desc")]));

    return onSnapshot(
        collectionQuery,
        (snapshot) => onData(snapshot.docs.map((entry) => mapFirestoreDocument<T>(entry))),
        (error) => options?.onError?.(error as Error),
    );
}

export function subscribeDocument<T>(
    collectionName: string,
    documentId: string,
    onData: (item: T | null) => void,
    onError?: (error: Error) => void,
): Unsubscribe {
    return onSnapshot(
        doc(db, collectionName, documentId),
        (snapshot) => {
            if (!snapshot.exists()) {
                onData(null);
                return;
            }

            onData({
                id: snapshot.id,
                ...(snapshot.data() as Omit<T, "id">),
            } as T);
        },
        (error) => onError?.(error as Error),
    );
}
