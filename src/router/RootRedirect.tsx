import { Navigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/context/useAuth";
import { LoadingGlobal} from "@/shared/pages/LoadingGlobal";

export function RootRedirect() {
    const { user, profile, loading } = useAuth();

    if (loading) return <LoadingGlobal />;

    return <Navigate to={user ? (profile?.status === "approved" ? "/dashboard" : "/acesso-pendente") : "/login"} replace />;
}
