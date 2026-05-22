import { useEffect, useMemo, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { auth } from "@/services/firebase";
import { AuthContext } from "./AuthContextObject";
import type { UserProfile } from "./AuthContextObject";
import { ensureUserProfile } from "../services/userProfiles";

interface AuthProviderProps {
    children: ReactNode;
}

const MIN_AUTH_LOADING_MS = 600;

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        const finishLoading = (startedAt: number) => {
            const elapsed = Date.now() - startedAt;
            const remaining = Math.max(MIN_AUTH_LOADING_MS - elapsed, 0);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                setLoading(false);
            }, remaining);
        };

        const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
            const cycleStart = Date.now();

            setUser(nextUser);
            setLoading(true);

            if (!nextUser) {
                setProfile(null);
                finishLoading(cycleStart);
                return;
            }

            try {
                const nextProfile = await ensureUserProfile(nextUser);
                setProfile(nextProfile);
            } catch {
                setProfile(null);
                await signOut(auth);
            } finally {
                finishLoading(cycleStart);
            }
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
            profile,
            role: profile?.role ?? null,
            isAdmin: profile?.role === "admin",
            loading,
            login: async (email: string, password: string) => {
                await signInWithEmailAndPassword(auth, email, password);
            },
            logout: async () => {
                await signOut(auth);
            },
        }),
        [loading, profile, user],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
