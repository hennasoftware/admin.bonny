import type { LucideIcon } from "lucide-react";

export interface SidebarEntry {
    label: string;
    path: string;
    icon: LucideIcon;
}

export interface SidebarSection {
    section: string;
    items: SidebarEntry[];
}
