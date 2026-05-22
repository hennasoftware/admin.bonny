import type { AppDateValue } from "@/shared/utils/date";

export type SystemLogModule = "animals" | "adopters" | "adoptions" | "users";
export type SystemLogAction = "create" | "update" | "delete";

export interface SystemLogRecord {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    action: SystemLogAction;
    module: SystemLogModule;
    targetId: string;
    description: string;
    createdAt: AppDateValue;
}
