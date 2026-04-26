import { useMinimumLoading } from "@/shared/hooks/useMinimumLoading";
import { LoadingGlobal } from "@/shared/pages/LoadingGlobal";
import {Navigate} from "react-router-dom";
import {useAuth} from "@/modules/auth/context/AuthContext";

export function AuthRedirect({ children }: any) {
    const { user, loading } = useAuth();

    const showLoading = useMinimumLoading(loading, 700);

    if (showLoading) return <LoadingGlobal />;

    if (user) return <Navigate to="/dashboard" replace />;

    return children;
}
