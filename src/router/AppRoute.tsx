import { Route, Routes } from "react-router-dom";
import { AdminLogsPage, AdminUsersPage } from "@/modules/admin";
import { LoginPage, PendingApprovalPage, RegisterPage } from "@/modules/auth";
import { AnimalsCreatePage, AnimalsListPage } from "@/modules/animals";
import { AdoptersCreatePage, AdoptersListPage } from "@/modules/adopters";
import { AdoptionsCreatePage, AdoptionsListPage } from "@/modules/adoptions";
import { DashboardPage, SystemUpdatesPage } from "@/modules/dashboard";
import { ModulePlaceholderPage } from "@/modules/dashboard/ModulePlaceholderPage";
import { SystemUpdatesSeedPage } from "@/modules/dashboard/SystemUpdatesSeedPage";
import { AdminRoute } from "./AdminRoute";
import { AuthRedirect } from "./AuthRedirect";
import { ProtectedRoute } from "./ProtectedRoute";
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

            <Route
                path="/cadastro"
                element={
                    <AuthRedirect>
                        <RegisterPage />
                    </AuthRedirect>
                }
            />

            <Route path="/acesso-pendente" element={<PendingApprovalPage />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/atualizacoes" element={<SystemUpdatesPage />} />
                <Route path="/animais" element={<AnimalsListPage />} />
                <Route path="/animais/lista" element={<AnimalsListPage />} />
                <Route path="/animais/cadastro" element={<AnimalsCreatePage />} />
                <Route path="/adotantes" element={<AdoptersListPage />} />
                <Route path="/adotantes/lista" element={<AdoptersListPage />} />
                <Route path="/adotantes/cadastro" element={<AdoptersCreatePage />} />
                <Route path="/adocoes" element={<AdoptionsListPage />} />
                <Route path="/adocoes/lista" element={<AdoptionsListPage />} />
                <Route path="/adocoes/cadastro" element={<AdoptionsCreatePage />} />
                <Route path="/__internal/system-updates-sync-9x4k" element={<SystemUpdatesSeedPage />} />
                <Route
                    path="/processos"
                    element={
                        <ModulePlaceholderPage
                            title="Processos"
                            description="Acompanhe visitas, avaliações e etapas do fluxo de adoção em um único lugar."
                        />
                    }
                />
            </Route>

            <Route element={<AdminRoute />}>
                <Route path="/admin/logs" element={<AdminLogsPage />} />
                <Route path="/admin/usuarios" element={<AdminUsersPage />} />
            </Route>

            {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
    );
}
