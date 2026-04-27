import {
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    startAfter,
    DocumentData,
    QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/services/firebase";

export async function getAnimalsPaginated(
    pageSize: number,
    cursor?: QueryDocumentSnapshot<DocumentData>
) {
    const baseQuery = query(
        collection(db, "animals"),
        orderBy("createdAt", "desc"),
        limit(pageSize)
    );

    const paginatedQuery = cursor
        ? query(
            collection(db, "animals"),
            orderBy("createdAt", "desc"),
            startAfter(cursor),
            limit(pageSize)
        )
        : baseQuery;

    const snapshot = await getDocs(paginatedQuery);

    const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));

    return {
        data,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
}
