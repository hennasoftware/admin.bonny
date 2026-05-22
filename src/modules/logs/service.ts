import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where, type QueryConstraint } from "firebase/firestore";
import type { UserProfile } from "@/modules/auth";
import { db } from "@/services/firebase";
import type { SystemLogAction, SystemLogModule, SystemLogRecord } from "./types";

const LOGS_COLLECTION = "systemLogs";

export interface CreateSystemLogInput {
    action: SystemLogAction;
    module: SystemLogModule;
    targetId: string;
    description: string;
}

export async function createSystemLog(profile: UserProfile, input: CreateSystemLogInput) {
    await addDoc(collection(db, LOGS_COLLECTION), {
        userId: profile.id,
        userName: profile.name,
        userEmail: profile.email,
        action: input.action,
        module: input.module,
        targetId: input.targetId,
        description: input.description,
        createdAt: serverTimestamp(),
    });
}

export interface SystemLogsFilters {
    userId?: string;
    module?: SystemLogModule | "all";
    action?: SystemLogAction | "all";
}

function mapSystemLog(entry: { id: string; data: () => unknown }): SystemLogRecord {
    return {
        id: entry.id,
        ...(entry.data() as Omit<SystemLogRecord, "id">),
    };
}

export async function listSystemLogs(filters: SystemLogsFilters = {}) {
    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

    if (filters.userId && filters.userId !== "all") {
        constraints.unshift(where("userId", "==", filters.userId));
    }

    if (filters.module && filters.module !== "all") {
        constraints.unshift(where("module", "==", filters.module));
    }

    if (filters.action && filters.action !== "all") {
        constraints.unshift(where("action", "==", filters.action));
    }

    const snapshot = await getDocs(query(collection(db, LOGS_COLLECTION), ...constraints));
    return snapshot.docs.map(mapSystemLog);
}

export function getSystemLogActionLabel(action: SystemLogAction) {
    if (action === "create") return "Criacao";
    if (action === "update") return "Edicao";
    return "Exclusao";
}

export function getSystemLogModuleLabel(module: SystemLogModule) {
    if (module === "animals") return "Animais";
    if (module === "adopters") return "Adotantes";
    if (module === "adoptions") return "Adocoes";
    return "Usuarios";
}
