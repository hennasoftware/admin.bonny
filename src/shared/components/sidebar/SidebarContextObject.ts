import { createContext } from "react";

export interface SidebarContextValue {
    collapsed: boolean;
    openMobile: boolean;
    toggleCollapse: () => void;
    toggleMobile: () => void;
    closeMobile: () => void;
}

export const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);
