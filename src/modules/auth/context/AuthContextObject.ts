import { createContext } from "react";
import type { User } from "firebase/auth";
import type { AppDateValue } from "@/shared/utils/date";

export type UserRole = "admin" | "standard";

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: "pending" | "approved" | "rejected";
    createdAt?: AppDateValue;
    approvedAt?: AppDateValue;
    approvedBy?: string | null;
    createdBy?: string | null;
}

export interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    role: UserRole | null;
    isAdmin: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
