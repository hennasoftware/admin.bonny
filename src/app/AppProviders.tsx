import type { ReactNode } from "react";
import { AuthProvider } from "@/modules/auth/context/AuthContext";
import { ThemeProvider } from "@/styles/themes/ThemeContext";

interface AppProvidersProps {
    children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <AuthProvider>
            <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
    );
}
