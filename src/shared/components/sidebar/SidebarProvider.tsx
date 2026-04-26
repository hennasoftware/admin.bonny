import { useMemo, useState, type ReactNode } from "react";
import { SidebarContext } from "./SidebarContextObject";

interface SidebarProviderProps {
    children: ReactNode;
    defaultCollapsed?: boolean;
}

export function SidebarProvider({ children, defaultCollapsed = false }: SidebarProviderProps) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);
    const [openMobile, setOpenMobile] = useState(false);

    const value = useMemo(
        () => ({
            collapsed,
            openMobile,
            toggleCollapse: () => setCollapsed((current) => !current),
            toggleMobile: () => setOpenMobile((current) => !current),
            closeMobile: () => setOpenMobile(false),
        }),
        [collapsed, openMobile],
    );

    return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
