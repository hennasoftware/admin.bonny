import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardPage } from "./DashboardPage";
import type { DashboardSnapshot } from "./types";

const logoutMock = vi.fn();
const getDashboardSnapshotMock = vi.fn();

vi.mock("@/modules/auth/context/useAuth", () => ({
    useAuth: () => ({
        user: { email: "admin@bonny.dev" },
        logout: logoutMock,
    }),
}));

vi.mock("./service", () => ({
    getDashboardSnapshot: () => getDashboardSnapshotMock(),
}));

describe("DashboardPage", () => {
    beforeEach(() => {
        logoutMock.mockReset();
        getDashboardSnapshotMock.mockReset();
    });

    it("renders dashboard data returned by the service", async () => {
        const snapshot: DashboardSnapshot = {
            stats: [
                {
                    title: "Adoções ativas",
                    value: "10",
                    growth: "+2,0%",
                    icon: (() => null) as never,
                },
            ],
            monthlyAdoptions: [
                { month: "Jan", value: 3 },
                { month: "Fev", value: 5 },
            ],
            recentAdoptions: [
                {
                    id: "ADO-1",
                    petName: "Luna",
                    adopterName: "Maria",
                    status: "Concluída",
                    date: "Hoje, 09:00",
                },
            ],
        };

        getDashboardSnapshotMock.mockResolvedValue(snapshot);

        render(
            <MemoryRouter>
                <DashboardPage />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText("Adoções ativas")).toBeInTheDocument();
        });

        expect(screen.getByText(/Luna/)).toBeInTheDocument();
        expect(screen.getByText("Adoções por mês")).toBeInTheDocument();
    });
});
