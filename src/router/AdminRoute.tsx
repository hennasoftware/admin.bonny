import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/modules/auth/context/useAuth";
import { LoadingGlobal } from "@/shared/pages/LoadingGlobal";

export function AdminRoute() {
    const { user, profile, isAdmin, loading } = useAuth();
    const location = useLocation();

    if (loading) return <LoadingGlobal />;

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (profile?.status !== "approved") {
        return <Navigate to="/acesso-pendente" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
