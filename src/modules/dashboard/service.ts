import { dashboardSnapshotMock } from "./data";
import type { DashboardSnapshot } from "./types";

const DASHBOARD_DELAY_MS = 300;

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
    await new Promise((resolve) => {
        window.setTimeout(resolve, DASHBOARD_DELAY_MS);
    });

    return dashboardSnapshotMock;
}
