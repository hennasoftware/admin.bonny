import {
    doc,
    collection,
    getDoc,
    getDocs,
    limit,
    orderBy,
    serverTimestamp,
    setDoc,
    query,
    updateDoc,
    writeBatch,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile, type User } from "firebase/auth";
import type { UserProfile, UserRole } from "../context/AuthContextObject";
import { auth, db } from "@/services/firebase";
import { createSystemLog } from "@/modules/logs/service";

const USERS_COLLECTION = "users";
const AUTH_BOOTSTRAP_DOCUMENT = doc(db, "system_bootstrap", "auth");

function mapUserProfile(id: string, data: unknown): UserProfile {
    const payload = data as Omit<UserProfile, "id">;

    return {
        id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        status: payload.status,
        createdAt: payload.createdAt,
        approvedAt: payload.approvedAt,
        approvedBy: payload.approvedBy ?? null,
        createdBy: payload.createdBy ?? null,
    };
}

export async function getUserProfile(userId: string) {
    const snapshot = await getDoc(doc(db, USERS_COLLECTION, userId));

    if (!snapshot.exists()) {
        return null;
    }

    return mapUserProfile(snapshot.id, snapshot.data());
}

function getUserDisplayName(user: User, fallbackName?: string) {
    return fallbackName?.trim() || user.displayName?.trim() || user.email?.split("@")[0] || "Usuario Bonny";
}

export async function ensureUserProfile(user: User, fallbackName?: string) {
    const existingProfile = await getUserProfile(user.uid);
    if (existingProfile) {
        return existingProfile;
    }

    const userRef = doc(db, USERS_COLLECTION, user.uid);
    const bootstrapSnap = await getDoc(AUTH_BOOTSTRAP_DOCUMENT);
    const isFirstUser = !bootstrapSnap.exists();
    const role: UserRole = isFirstUser ? "admin" : "standard";
    const status: UserProfile["status"] = isFirstUser ? "approved" : "pending";
    const nextProfilePayload = {
        name: getUserDisplayName(user, fallbackName),
        email: user.email ?? "",
        role,
        status,
        createdBy: isFirstUser ? user.uid : null,
        approvedBy: isFirstUser ? user.uid : null,
        createdAt: serverTimestamp(),
        approvedAt: isFirstUser ? serverTimestamp() : null,
    };

    try {
        if (isFirstUser) {
            const batch = writeBatch(db);
            batch.set(userRef, nextProfilePayload);
            batch.set(AUTH_BOOTSTRAP_DOCUMENT, {
                initializedAt: serverTimestamp(),
                initializedBy: user.uid,
            });
            await batch.commit();
        } else {
            await setDoc(userRef, nextProfilePayload);
        }
    } catch (error) {
        const concurrentProfile = await getUserProfile(user.uid);
        if (concurrentProfile) {
            return concurrentProfile;
        }

        throw error;
    }

    const nextProfile = await getUserProfile(user.uid);
    if (!nextProfile) {
        throw new Error("Nao foi possivel inicializar o perfil do usuario.");
    }

    return nextProfile;
}

export interface RegisterUserInput {
    name: string;
    email: string;
    password: string;
}

export async function registerUser(input: RegisterUserInput) {
    const credentials = await createUserWithEmailAndPassword(auth, input.email, input.password);

    if (input.name.trim()) {
        await updateProfile(credentials.user, { displayName: input.name.trim() });
    }

    await ensureUserProfile(credentials.user, input.name);
    return credentials.user;
}

export async function listUsers() {
    const snapshot = await getDocs(query(collection(db, USERS_COLLECTION), orderBy("createdAt", "desc"), limit(100)));
    return snapshot.docs.map((entry) => mapUserProfile(entry.id, entry.data()));
}

export async function approveUser(userId: string, role: UserRole, adminProfile: UserProfile) {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userProfile = await getUserProfile(userId);

    if (!userProfile) {
        throw new Error("Usuario nao encontrado.");
    }

    await updateDoc(userRef, {
        role,
        status: "approved",
        approvedAt: serverTimestamp(),
        approvedBy: adminProfile.id,
    });

    await createSystemLog(adminProfile, {
        action: "update",
        module: "users",
        targetId: userId,
        description: `Aprovou o usuario ${userProfile.name} com cargo ${role === "admin" ? "administrador" : "colaborador"}.`,
    });
}

export async function rejectUser(userId: string, adminProfile: UserProfile) {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userProfile = await getUserProfile(userId);

    if (!userProfile) {
        throw new Error("Usuario nao encontrado.");
    }

    await updateDoc(userRef, {
        status: "rejected",
        approvedAt: serverTimestamp(),
        approvedBy: adminProfile.id,
    });

    await createSystemLog(adminProfile, {
        action: "update",
        module: "users",
        targetId: userId,
        description: `Rejeitou a solicitacao de acesso de ${userProfile.name}.`,
    });
}
