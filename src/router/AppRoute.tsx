import { Routes, Route } from "react-router-dom";
import { LoginPage } from "@/modules/auth";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthRedirect } from "./AuthRedirect";
import { RootRedirect } from "./RootRedirect";

export function AppRoute() {
    return (
        <Routes>
            <Route path="/" element={<RootRedirect />} />

            <Route
                path="/login"
                element={
                    <AuthRedirect>
                        <LoginPage />
                    </AuthRedirect>
                }
            />

            <Route element={<ProtectedRoute />}>
                {/*<Route path="/dashboard" element={<DashboardPage />} />*/}
            </Route>


            {/*<Route path="*" element={<NotFoundPage />} />*/}
        </Routes>
    );
}