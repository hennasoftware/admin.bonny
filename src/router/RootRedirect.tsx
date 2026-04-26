import { Navigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/context/AuthContext";
import { LoadingGlobal} from "@/shared/pages/LoadingGlobal";
import { useMinimumLoading } from "@/shared/hooks/useMinimumLoading";

export function RootRedirect() {
    const { user, loading } = useAuth();
    const showLoading = useMinimumLoading(loading, 800);

    if (showLoading) return <LoadingGlobal />;

    return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}
