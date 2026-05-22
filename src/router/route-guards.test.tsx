import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminRoute } from "./AdminRoute";
import { AuthRedirect } from "./AuthRedirect";
import { ProtectedRoute } from "./ProtectedRoute";
import { RootRedirect } from "./RootRedirect";

const useAuthMock = vi.fn();

vi.mock("@/modules/auth/context/useAuth", () => ({
    useAuth: () => useAuthMock(),
}));

describe("route guards", () => {
    beforeEach(() => {
        useAuthMock.mockReset();
    });

    it("shows loading while auth is initializing", () => {
        useAuthMock.mockReturnValue({ user: null, loading: true });

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <ProtectedRoute />
            </MemoryRouter>,
        );

        expect(screen.getByText("Carregando sistema...")).toBeInTheDocument();
    });

    it("redirects unauthenticated access to login", () => {
        useAuthMock.mockReturnValue({ user: null, loading: false });

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<div>Painel</div>} />
                    </Route>
                    <Route path="/login" element={<div>Tela de login</div>} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByText("Tela de login")).toBeInTheDocument();
    });

    it("redirects authenticated users away from login", () => {
        useAuthMock.mockReturnValue({ user: { email: "admin@bonny.dev" }, profile: { status: "approved" }, loading: false });

        render(
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <AuthRedirect>
                                <div>Login</div>
                            </AuthRedirect>
                        }
                    />
                    <Route path="/dashboard" element={<div>Dashboard</div>} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("redirects root to dashboard when a session exists", () => {
        useAuthMock.mockReturnValue({ user: { email: "admin@bonny.dev" }, profile: { status: "approved" }, loading: false });

        render(
            <MemoryRouter initialEntries={["/"]}>
                <Routes>
                    <Route path="/" element={<RootRedirect />} />
                    <Route path="/dashboard" element={<div>Dashboard</div>} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("redirects pending users to the waiting screen", () => {
        useAuthMock.mockReturnValue({
            user: { email: "user@bonny.dev" },
            profile: { status: "pending" },
            loading: false,
        });

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<div>Painel</div>} />
                    </Route>
                    <Route path="/acesso-pendente" element={<div>Aguardando</div>} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByText("Aguardando")).toBeInTheDocument();
    });

    it("redirects non-admin users away from admin routes", () => {
        useAuthMock.mockReturnValue({
            user: { email: "user@bonny.dev" },
            profile: { role: "standard", status: "approved" },
            isAdmin: false,
            loading: false,
        });

        render(
            <MemoryRouter initialEntries={["/admin/logs"]}>
                <Routes>
                    <Route element={<AdminRoute />}>
                        <Route path="/admin/logs" element={<div>Logs</div>} />
                    </Route>
                    <Route path="/dashboard" element={<div>Dashboard</div>} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("allows admin users into admin routes", () => {
        useAuthMock.mockReturnValue({
            user: { email: "admin@bonny.dev" },
            profile: { role: "admin", status: "approved" },
            isAdmin: true,
            loading: false,
        });

        render(
            <MemoryRouter initialEntries={["/admin/logs"]}>
                <Routes>
                    <Route element={<AdminRoute />}>
                        <Route path="/admin/logs" element={<div>Logs</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByText("Logs")).toBeInTheDocument();
    });
});
