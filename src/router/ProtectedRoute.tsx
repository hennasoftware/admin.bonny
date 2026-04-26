import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/modules/auth/context/AuthContext";
import { LoadingGlobal } from "@/shared/pages/LoadingGlobal";
import { useMinimumLoading } from "@/shared/hooks/useMinimumLoading";

export function ProtectedRoute() {
    const { user, loading } = useAuth();
    const location = useLocation();
    const showLoading = useMinimumLoading(loading, 800);

    if (showLoading) return <LoadingGlobal />;

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}
