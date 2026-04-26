import { SidebarItem } from "./SidebarItem";
import { useSidebar } from "./useSidebar";
import type { SidebarSection } from "./types";

interface SidebarMenuProps {
    sections: SidebarSection[];
}

export function SidebarMenu({ sections }: SidebarMenuProps) {
    const { collapsed, closeMobile } = useSidebar();

    return (
        <nav className="min-h-0 flex-1 overflow-y-auto p-3">
            {sections.map((section, index) => (
                <div key={section.section} className="mb-6 last:mb-0">
                    <p
                        className={[
                            "mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500",
                            collapsed ? "md:hidden" : "",
                        ].join(" ")}
                    >
                        {section.section}
                    </p>

                    {collapsed && index !== 0 && <div className="my-4 h-px w-full bg-orange-100 dark:bg-slate-800" />}

                    <div className={`flex flex-col gap-2 ${collapsed ? "items-start md:items-center" : ""}`}>
                        {section.items.map((item) => (
                            <SidebarItem
                                key={item.path}
                                {...item}
                                collapsed={collapsed}
                                onNavigate={closeMobile}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </nav>
    );
}
