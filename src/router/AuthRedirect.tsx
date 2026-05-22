import { LoadingGlobal } from "@/shared/pages/LoadingGlobal";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/context/useAuth";

interface AuthRedirectProps {
    children: ReactNode;
}

export function AuthRedirect({ children }: AuthRedirectProps) {
    const { user, profile, loading } = useAuth();

    if (loading) return <LoadingGlobal />;

    if (user) return <Navigate to={profile?.status === "approved" ? "/dashboard" : "/acesso-pendente"} replace />;

    return children;
}
