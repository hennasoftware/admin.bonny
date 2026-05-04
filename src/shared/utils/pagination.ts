import {
    collection,
    getCountFromServer,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
    where,
    type DocumentData,
    type QueryConstraint,
    type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/services/firebase";

export interface PageRequest {
    collectionName: string;
    pageSize: number;
    cursor?: QueryDocumentSnapshot<DocumentData> | null;
    filters?: QueryConstraint[];
}

export interface PageResponse<T> {
    data: T[];
    nextCursor: QueryDocumentSnapshot<DocumentData> | null;
    total: number;
    hasNextPage: boolean;
}

export async function getCollectionPage<T>({
    collectionName,
    pageSize,
    cursor = null,
    filters = [],
}: PageRequest, mapDoc: (doc: QueryDocumentSnapshot<DocumentData>) => T): Promise<PageResponse<T>> {
    const baseRef = collection(db, collectionName);
    const baseQuery = query(baseRef, ...filters);
    const pagedQuery = cursor
        ? query(baseRef, ...filters, startAfter(cursor), limit(pageSize + 1))
        : query(baseRef, ...filters, limit(pageSize + 1));

    const [countSnapshot, pageSnapshot] = await Promise.all([getCountFromServer(baseQuery), getDocs(pagedQuery)]);
    const docs = pageSnapshot.docs;
    const hasNextPage = docs.length > pageSize;
    const visibleDocs = hasNextPage ? docs.slice(0, pageSize) : docs;

    return {
        data: visibleDocs.map(mapDoc),
        nextCursor: visibleDocs[visibleDocs.length - 1] ?? null,
        total: countSnapshot.data().count,
        hasNextPage,
    };
}

export function buildPagedConstraints(status?: string) {
    const constraints: QueryConstraint[] = [];

    if (status && status !== "Todos") {
        constraints.push(where("status", "==", status));
    }

    constraints.push(orderBy("createdAt", "desc"));

    return constraints;
}
