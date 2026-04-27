import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/services/firebase";

type Filters = {
    search?: string;
    status?: string;
    species?: string;
};

export function useAnimals(page: number, pageSize = 10, filters: Filters = {}) {
    const [animals, setAnimals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    const { search = "", status = "", species = "" } = filters;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            const baseRef = collection(db, "animals");

            let q = query(baseRef, orderBy("createdAt", "desc"));

            if (search && search.trim()) {
                q = query(
                    baseRef,
                    where("name", ">=", search),
                    where("name", "<=", search + "\uf8ff"),
                    orderBy("name")
                );
            }

            const snapshot = await getDocs(q);

            let all = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            if (status) {
                all = all.filter((a: any) => a.status === status);
            }

            if (species) {
                all = all.filter((a: any) => a.species === species);
            }

            const start = (page - 1) * pageSize;
            const end = start + pageSize;

            setAnimals(all.slice(start, end));
            setTotalPages(Math.max(1, Math.ceil(all.length / pageSize)));

            setLoading(false);
        };

        fetchData();
    }, [page, pageSize, search, status, species]);

    return {
        animals,
        loading,
        totalPages,
    };
}
