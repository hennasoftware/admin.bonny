import {createContext, useContext, useEffect, useState} from "react";
import {onAuthStateChanged, signInWithEmailAndPassword, signOut, type User,} from "firebase/auth";
import {auth} from "@/services/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const start = Date.now();

        return onAuthStateChanged(auth, (user) => {
            setUser(user);

            const elapsed = Date.now() - start;
            const minLoadingTime = 600;

            const remaining = minLoadingTime - elapsed;

            setTimeout(() => {
                setLoading(false);
            }, remaining > 0 ? remaining : 0);
        });
    }, []);

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
