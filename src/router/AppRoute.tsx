import { Route, Routes } from "react-router-dom";
import { LoginPage } from "@/modules/auth";
import { AnimalsCreatePage, AnimalsListPage } from "@/modules/animals";
import { DashboardPage } from "@/modules/dashboard";
import { ModulePlaceholderPage } from "@/modules/dashboard/ModulePlaceholderPage";
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

            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/animais" element={<AnimalsListPage />} />
                <Route path="/animais/lista" element={<AnimalsListPage />} />
                <Route path="/animais/cadastro" element={<AnimalsCreatePage />} />
                <Route
                    path="/adotantes"
                    element={
                        <ModulePlaceholderPage
                            title="Adotantes"
                            description="Gerencie o histórico dos adotantes, contatos e critérios de aprovação."
                        />
                    }
                />
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

            {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
    );
}
