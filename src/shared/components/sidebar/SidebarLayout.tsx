import type { ReactNode } from "react";
import { ChevronLeft, Menu, X } from "lucide-react";
import { SidebarMenu } from "./SidebarMenu";
import { useSidebar } from "./useSidebar";
import type { SidebarSection } from "./types";

interface SidebarLayoutProps {
    brand: string;
    brandCompact: string;
    sections: SidebarSection[];
    footer?: ReactNode;
    children: ReactNode;
}

export function SidebarLayout({
    brand,
    brandCompact,
    sections,
    footer,
    children,
}: SidebarLayoutProps) {
    const { collapsed, openMobile, toggleCollapse, toggleMobile, closeMobile } = useSidebar();

    return (
        <div className="relative min-h-screen md:flex md:items-stretch">
            <button
                type="button"
                aria-label="Abrir menu lateral"
                onClick={toggleMobile}
                className={`fixed top-4 right-4 z-30 rounded-2xl border border-white/70 bg-white/92 p-3 text-gray-700 shadow-[0_16px_40px_-24px_rgb(15_23_42/0.45)] backdrop-blur transition-opacity dark:border-slate-700/60 dark:bg-slate-900/90 dark:text-gray-200 md:hidden ${openMobile ? "pointer-events-none opacity-0" : "opacity-100"}`}
            >
                <Menu className="h-5 w-5" />
            </button>

            <div
                onClick={closeMobile}
                className={`fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-sm transition-opacity duration-300 md:hidden ${openMobile ? "opacity-100" : "pointer-events-none opacity-0"}`}
            />

            <aside
                className={`fixed inset-y-0 left-0 z-40 flex h-dvh min-h-0 flex-col overflow-hidden border-r border-white/70 bg-white/92 shadow-[0_24px_80px_-40px_rgb(15_23_42/0.55)] backdrop-blur transition-[width,transform] duration-300 ease-in-out dark:border-slate-700/60 dark:bg-slate-950/92 md:sticky md:top-0 md:h-screen md:translate-x-0 md:self-start md:shadow-none ${collapsed ? "md:w-24" : "md:w-72"} ${openMobile ? "translate-x-0" : "-translate-x-full"} w-72`}
            >
                <div className={`flex items-center border-b border-slate-200/70 p-3 dark:border-slate-800 ${collapsed ? "justify-start md:justify-center" : ""}`}>
                    <div className={`min-w-0 ${collapsed ? "text-left md:text-center" : "flex-1"}`}>
                        <h1 className="truncate text-base font-semibold tracking-tight text-gray-950 dark:text-white">
                            {collapsed ? (
                                <>
                                    <span className="md:hidden">{brand}</span>
                                    <span className="hidden md:inline">{brandCompact}</span>
                                </>
                            ) : (
                                brand
                            )}
                        </h1>
                        <p
                            className={[
                                "mt-0.5 truncate text-xs text-gray-400 dark:text-gray-500",
                                collapsed ? "md:hidden" : "",
                            ].join(" ")}
                        >
                            Painel administrativo
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={toggleCollapse}
                        aria-label="Colapsar sidebar"
                        className="hidden rounded-xl p-2 text-gray-500 transition-colors hover:bg-orange-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white md:flex"
                    >
                        <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
                    </button>

                    <button
                        type="button"
                        onClick={closeMobile}
                        aria-label="Fechar menu lateral"
                        className="ml-auto rounded-xl p-2 text-gray-500 transition-colors hover:bg-orange-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white md:hidden"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <SidebarMenu sections={sections} />

                {footer && (
                    <div className="mt-auto border-t border-slate-200/70 p-3 dark:border-slate-800">
                        {footer}
                    </div>
                )}
            </aside>

            <div className="min-w-0 flex-1">
                <div className="min-h-screen">{children}</div>
            </div>
        </div>
    );
}
