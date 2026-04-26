import { useEffect, useMemo, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { auth } from "@/services/firebase";
import { AuthContext } from "./AuthContextObject";

interface AuthProviderProps {
    children: ReactNode;
}

const MIN_AUTH_LOADING_MS = 600;

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const start = Date.now();
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
            const elapsed = Date.now() - start;
            const remaining = Math.max(MIN_AUTH_LOADING_MS - elapsed, 0);

            setUser(nextUser);

            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                setLoading(false);
            }, remaining);
        });

        return () => {
            unsubscribe();

            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            login: async (email: string, password: string) => {
                await signInWithEmailAndPassword(auth, email, password);
            },
            logout: async () => {
                await signOut(auth);
            },
        }),
        [loading, user],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
