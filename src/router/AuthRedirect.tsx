import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/modules/auth/context/AuthContext";
import { LoadingGlobal } from "@/shared/pages/LoadingGlobal";
import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

export function AuthRedirect({ children }: Props) {
    const { user, loading } = useAuth();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/dashboard";

    if (loading) return <LoadingGlobal />;

    if (user) return <Navigate to={from} replace />;

    return <>{children}</>;
}
