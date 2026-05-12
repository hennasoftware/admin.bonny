import { BadgeCheck, CalendarClock, PawPrint, Users } from "lucide-react";
import { orderBy } from "firebase/firestore";
import type { AdoptionRecord, AdoptionStatus } from "@/modules/adoptions/services/service";
import { subscribeAdoptions } from "@/modules/adoptions/services/service";
import { subscribeAdopters } from "@/modules/adopters/services/service";
import { subscribeAnimals } from "@/modules/animals/services/service";
import { subscribeCollection, subscribeDocument } from "@/shared/services/firestoreRealtime";
import { formatDateTime, formatMonthLabel, getMonthKey, toDate } from "@/shared/utils/date";
import type {
    DashboardMonthlyAggregateRecord,
    DashboardSnapshot,
    DashboardSummaryRecord,
    MonthlyOrdersPoint,
} from "./types";
import type { AdopterRecord } from "@/modules/adopters/types";
import type { AnimalRecord } from "@/modules/animals/types/types";

const DASHBOARD_SUMMARY_COLLECTION = "dashboard_summary";
const DASHBOARD_SUMMARY_DOCUMENT = "current";
const DASHBOARD_MONTHLY_COLLECTION = "dashboard_monthly";

export function subscribeDashboardSnapshot(
    onData: (snapshot: DashboardSnapshot) => void,
    onError?: (error: Error) => void,
) {
    let summary: DashboardSummaryRecord | null = null;
    let monthlyAggregates: DashboardMonthlyAggregateRecord[] = [];
    let recentAdoptions: AdoptionRecord[] = [];
    let animals: AnimalRecord[] = [];
    let adopters: AdopterRecord[] = [];
    let adoptions: AdoptionRecord[] = [];

    const emit = () => {
        const hasAggregates = monthlyAggregates.length > 0;

        onData(
            hasAggregates
                ? buildDashboardSnapshot({ summary, monthlyAggregates, recentAdoptions, animals, adopters, adoptions })
                : buildDashboardSnapshotFromCollections({ animals, adopters, adoptions }),
        );
    };

    const unsubscribers = [
        subscribeDocument<DashboardSummaryRecord>(
            DASHBOARD_SUMMARY_COLLECTION,
            DASHBOARD_SUMMARY_DOCUMENT,
            (nextSummary) => {
                summary = nextSummary;
                emit();
            },
            onError,
        ),
        subscribeCollection<DashboardMonthlyAggregateRecord>(
            DASHBOARD_MONTHLY_COLLECTION,
            (items) => {
                monthlyAggregates = items;
                emit();
            },
            {
                constraints: [orderBy("__name__", "asc")],
                onError,
            },
        ),
        subscribeAnimals(
            (items) => {
                animals = items;
                emit();
            },
            onError,
        ),
        subscribeAdopters(
            (items) => {
                adopters = items;
                emit();
            },
            onError,
        ),
        subscribeAdoptions(
            (items) => {
                adoptions = items;
                recentAdoptions = items;
                emit();
            },
            onError,
        ),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}

interface DashboardSnapshotInput {
    summary: DashboardSummaryRecord | null;
    monthlyAggregates: DashboardMonthlyAggregateRecord[];
    recentAdoptions: AdoptionRecord[];
    animals: AnimalRecord[];
    adopters: AdopterRecord[];
    adoptions: AdoptionRecord[];
}

interface DashboardCollectionInput {
    animals: AnimalRecord[];
    adopters: AdopterRecord[];
    adoptions: AdoptionRecord[];
}

export function buildDashboardSnapshot({ summary, monthlyAggregates, recentAdoptions, animals, adopters, adoptions }: DashboardSnapshotInput): DashboardSnapshot {
    const timeline = buildDashboardTimeline(monthlyAggregates);
    const currentMonthCount = timeline.adoptions[timeline.adoptions.length - 1]?.value ?? 0;
    const previousMonthCount = timeline.adoptions[timeline.adoptions.length - 2]?.value ?? 0;
    const animalsTotal = summary?.animalsTotal ?? 0;
    const completedAdoptions = summary?.adoptionsCompletedTotal ?? 0;
    const conversionRate = animalsTotal === 0 ? 0 : Math.round((completedAdoptions / animalsTotal) * 100);

    return {
        stats: [
            {
                title: "Animais disponiveis",
                value: String(summary?.animalsAvailable ?? 0),
                growth: `${animalsTotal} animais monitorados`,
                icon: PawPrint,
            },
            {
                title: "Animais em processo",
                value: String(summary?.animalsInProcess ?? 0),
                growth: `${summary?.adoptionsOpen ?? 0} adocoes abertas`,
                icon: CalendarClock,
            },
            {
                title: "Adocoes concluidas no mes",
                value: String(currentMonthCount),
                growth: buildMonthlyTrendLabel(currentMonthCount, previousMonthCount),
                icon: BadgeCheck,
            },
            {
                title: "Taxa de conversao",
                value: `${conversionRate}%`,
                growth: `${summary?.adoptersActive ?? 0} adotantes ativos`,
                icon: Users,
            },
        ],
        monthlyAdoptions: timeline.adoptions,
        monthlyAnimals: timeline.animals,
        monthlyAdopters: timeline.adopters,
        chartHighlight: String(currentMonthCount),
        chartTrend: buildMonthlyTrendLabel(currentMonthCount, previousMonthCount),
        recentAdoptions: recentAdoptions.map((adoption) => ({
            id: adoption.id,
            petName: adoption.animalName || "Animal sem nome",
            adopterName: adoption.adopterName || "Adotante sem nome",
            status: normalizeAdoptionStatus(adoption.status),
            date: formatDateTime(adoption.updatedAt ?? adoption.createdAt, "Data indisponivel"),
            notesPreview: buildNotesPreview(adoption.notes),
        })),
        animals,
        adopters,
        adoptions,
    };
}

function buildDashboardSnapshotFromCollections({ animals, adopters, adoptions }: DashboardCollectionInput): DashboardSnapshot {
    const monthlyAdoptions = buildMonthlyAdoptions(adoptions);
    const monthlyAnimals = buildMonthlyEntities(animals.map((animal) => animal.createdAt));
    const monthlyAdopters = buildMonthlyEntities(adopters.map((adopter) => adopter.createdAt));
    const currentMonthCount = monthlyAdoptions[monthlyAdoptions.length - 1]?.value ?? 0;
    const previousMonthCount = monthlyAdoptions[monthlyAdoptions.length - 2]?.value ?? 0;
    const availableAnimals = animals.filter((animal) => animal.status === "Disponivel").length;
    const inProcessAnimals = animals.filter((animal) => animal.status === "Em processo").length;
    const activeAdopters = adopters.filter((adopter) => adopter.status === "Ativo").length;
    const completedAdoptions = adoptions.filter((adoption) => normalizeAdoptionStatus(adoption.status) === "Concluida").length;
    const conversionRate = animals.length === 0 ? 0 : Math.round((completedAdoptions / animals.length) * 100);

    return {
        stats: [
            {
                title: "Animais disponiveis",
                value: String(availableAnimals),
                growth: `${animals.length} animais monitorados`,
                icon: PawPrint,
            },
            {
                title: "Animais em processo",
                value: String(inProcessAnimals),
                growth: `${adoptions.filter((adoption) => normalizeAdoptionStatus(adoption.status) !== "Concluida").length} adocoes abertas`,
                icon: CalendarClock,
            },
            {
                title: "Adocoes concluidas no mes",
                value: String(currentMonthCount),
                growth: buildMonthlyTrendLabel(currentMonthCount, previousMonthCount),
                icon: BadgeCheck,
            },
            {
                title: "Taxa de conversao",
                value: `${conversionRate}%`,
                growth: `${activeAdopters} adotantes ativos`,
                icon: Users,
            },
        ],
        monthlyAdoptions,
        monthlyAnimals,
        monthlyAdopters,
        chartHighlight: String(currentMonthCount),
        chartTrend: buildMonthlyTrendLabel(currentMonthCount, previousMonthCount),
        recentAdoptions: adoptions.slice(0, 4).map((adoption) => ({
            id: adoption.id,
            petName: adoption.animalName || "Animal sem nome",
            adopterName: adoption.adopterName || "Adotante sem nome",
            status: normalizeAdoptionStatus(adoption.status),
            date: formatDateTime(adoption.updatedAt ?? adoption.createdAt, "Data indisponivel"),
            notesPreview: buildNotesPreview(adoption.notes),
        })),
        animals,
        adopters,
        adoptions,
    };
}

function buildMonthlyAdoptions(adoptions: AdoptionRecord[]) {
    const today = new Date();
    const buckets = Array.from({ length: 12 }, (_, index) => {
        const date = new Date(today.getFullYear(), today.getMonth() - (11 - index), 1);

        return {
            key: getMonthKey(date),
            month: formatMonthPeriodLabel(date),
            value: 0,
        };
    });

    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    for (const adoption of adoptions) {
        if (normalizeAdoptionStatus(adoption.status) !== "Concluida") continue;

        const date = toDate(adoption.createdAt);
        if (!date) continue;

        const bucket = bucketMap.get(getMonthKey(date));
        if (bucket) bucket.value += 1;
    }

    return buckets.map(({ month, value }) => ({ month, value }));
}

function buildMonthlyEntities(values: Array<AnimalRecord["createdAt"] | AdopterRecord["createdAt"]>) {
    const today = new Date();
    const buckets = Array.from({ length: 12 }, (_, index) => {
        const date = new Date(today.getFullYear(), today.getMonth() - (11 - index), 1);

        return {
            key: getMonthKey(date),
            month: formatMonthPeriodLabel(date),
            value: 0,
        };
    });

    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    for (const value of values) {
        const date = toDate(value);
        if (!date) continue;

        const bucket = bucketMap.get(getMonthKey(date));
        if (bucket) bucket.value += 1;
    }

    return buckets.map(({ month, value }) => ({ month, value }));
}

function buildDashboardTimeline(items: DashboardMonthlyAggregateRecord[]) {
    const months = buildLastMonths(12);
    const itemMap = new Map(items.map((item) => [item.id, item]));

    return {
        adoptions: months.map(({ key, label }) => ({ month: label, value: itemMap.get(key)?.adoptions ?? 0 })),
        animals: months.map(({ key, label }) => ({ month: label, value: itemMap.get(key)?.animals ?? 0 })),
        adopters: months.map(({ key, label }) => ({ month: label, value: itemMap.get(key)?.adopters ?? 0 })),
    };
}

function buildLastMonths(total: number) {
    const today = new Date();

    return Array.from({ length: total }, (_, index) => {
        const date = new Date(today.getFullYear(), today.getMonth() - (total - 1 - index), 1);
        return {
            key: getMonthKey(date),
            label: formatMonthPeriodLabel(date),
        };
    });
}

export function buildMonthlyTrendLabel(currentMonthCount: number, previousMonthCount: number) {
    if (previousMonthCount === 0 && currentMonthCount === 0) {
        return "Sem variacao no periodo";
    }

    if (previousMonthCount === 0) {
        return `${currentMonthCount} novas conclusoes neste mes`;
    }

    const delta = currentMonthCount - previousMonthCount;
    const percentage = Math.round((Math.abs(delta) / previousMonthCount) * 100);

    if (delta === 0) {
        return "Mesmo volume do mes anterior";
    }

    return delta > 0 ? `Alta de ${percentage}% vs. mes anterior` : `Queda de ${percentage}% vs. mes anterior`;
}

function normalizeAdoptionStatus(status?: AdoptionStatus | string): AdoptionStatus {
    if (status === "Concluida" || status === "Agendada" || status === "Em analise") return status;
    if (status === "Concluída") return "Concluida";
    if (status === "Em análise") return "Em analise";
    if (status === "ConcluÃ­da") return "Concluida";
    if (status === "Em anÃ¡lise") return "Em analise";
    return "Em analise";
}

export function createEmptyMonthlySeries(): MonthlyOrdersPoint[] {
    return buildLastMonths(12).map(({ label }) => ({
        month: label,
        value: 0,
    }));
}

function formatMonthPeriodLabel(date: Date) {
    return `${formatMonthLabel(date)}/${String(date.getFullYear()).slice(-2)}`;
}

function buildNotesPreview(notes?: string) {
    const trimmed = notes?.trim();
    if (!trimmed) return undefined;

    return trimmed.length > 96 ? `${trimmed.slice(0, 93).trimEnd()}...` : trimmed;
}
