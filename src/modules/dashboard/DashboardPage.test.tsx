import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/styles/themes/ThemeContext";
import { DashboardPage } from "./DashboardPage";
import type { DashboardSnapshot } from "./types";

const logoutMock = vi.fn();
const subscribeDashboardSnapshotMock = vi.fn();

vi.mock("@/modules/auth/context/useAuth", () => ({
    useAuth: () => ({
        user: { email: "admin@bonny.dev" },
        logout: logoutMock,
    }),
}));

vi.mock("./service", () => ({
    subscribeDashboardSnapshot: (...args: unknown[]) => subscribeDashboardSnapshotMock(...args),
}));

describe("DashboardPage", () => {
    beforeEach(() => {
        logoutMock.mockReset();
        subscribeDashboardSnapshotMock.mockReset();
    });

    it("renders dashboard data returned by the subscription", async () => {
        const snapshot: DashboardSnapshot = {
            stats: [
                {
                    title: "Animais disponiveis",
                    value: "10",
                    growth: "2 no mes",
                    icon: (() => null) as never,
                },
            ],
            monthlyAdoptions: [
                { month: "Jan", value: 3 },
                { month: "Fev", value: 5 },
            ],
            chartHighlight: "5",
            chartTrend: "Alta de 20%",
            recentAdoptions: [
                {
                    id: "ADO-1",
                    petName: "Luna",
                    adopterName: "Maria",
                    status: "Concluida",
                    date: "04/05/2026 09:00",
                },
            ],
        };

        subscribeDashboardSnapshotMock.mockImplementation((onData: (value: DashboardSnapshot) => void) => {
            onData(snapshot);
            return () => undefined;
        });

        render(
            <MemoryRouter>
                <ThemeProvider>
                    <DashboardPage />
                </ThemeProvider>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText("Animais disponiveis")).toBeInTheDocument();
        });

        expect(screen.getByRole("link", { name: /Abrir adoção Luna de Maria/i })).toBeInTheDocument();
        expect(screen.getByText("Adocoes por mes")).toBeInTheDocument();
    });
});
