import { BadgeCheck, CalendarClock, PawPrint, Users } from "lucide-react";
import { collection, onSnapshot, orderBy, query, type Unsubscribe } from "firebase/firestore";
import type { AdoptionRecord, AdoptionStatus } from "@/modules/adoptions/services/service";
import type { AdopterRecord } from "@/modules/adopters/types";
import type { AnimalRecord } from "@/modules/animals/types";
import { db } from "@/services/firebase";
import { formatDateTime, formatMonthLabel, getMonthKey, toDate } from "@/shared/utils/date";
import type { DashboardSnapshot } from "./types";

export function subscribeDashboardSnapshot(
    onData: (snapshot: DashboardSnapshot) => void,
    onError?: (error: Error) => void,
): Unsubscribe {
    let animals: AnimalRecord[] = [];
    let adopters: AdopterRecord[] = [];
    let adoptions: AdoptionRecord[] = [];

    const emit = () => onData(buildDashboardSnapshot({ animals, adopters, adoptions }));

    const unsubscribers = [
        onSnapshot(
            query(collection(db, "animals"), orderBy("createdAt", "desc")),
            (snapshot) => {
                animals = snapshot.docs.map((entry) => ({ id: entry.id, ...(entry.data() as Omit<AnimalRecord, "id">) }));
                emit();
            },
            (error) => onError?.(error as Error),
        ),
        onSnapshot(
            query(collection(db, "adopters"), orderBy("createdAt", "desc")),
            (snapshot) => {
                adopters = snapshot.docs.map((entry) => ({ id: entry.id, ...(entry.data() as Omit<AdopterRecord, "id">) }));
                emit();
            },
            (error) => onError?.(error as Error),
        ),
        onSnapshot(
            query(collection(db, "adoptions"), orderBy("createdAt", "desc")),
            (snapshot) => {
                adoptions = snapshot.docs.map((entry) => ({ id: entry.id, ...(entry.data() as Omit<AdoptionRecord, "id">) }));
                emit();
            },
            (error) => onError?.(error as Error),
        ),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}

interface DashboardInput {
    animals: AnimalRecord[];
    adopters: AdopterRecord[];
    adoptions: AdoptionRecord[];
}

export function buildDashboardSnapshot({ animals, adopters, adoptions }: DashboardInput): DashboardSnapshot {
    const monthlyAdoptions = buildMonthlyAdoptions(adoptions);
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
        chartHighlight: String(currentMonthCount),
        chartTrend: buildMonthlyTrendLabel(currentMonthCount, previousMonthCount),
        recentAdoptions: adoptions.slice(0, 4).map((adoption) => ({
            id: adoption.id,
            petName: adoption.animalName || "Animal sem nome",
            adopterName: adoption.adopterName || "Adotante sem nome",
            status: normalizeAdoptionStatus(adoption.status),
            date: formatDateTime(adoption.updatedAt ?? adoption.createdAt, "Data indisponivel"),
        })),
    };
}

function buildMonthlyAdoptions(adoptions: AdoptionRecord[]) {
    const today = new Date();
    const buckets = Array.from({ length: 12 }, (_, index) => {
        const date = new Date(today.getFullYear(), today.getMonth() - (11 - index), 1);

        return {
            key: getMonthKey(date),
            month: formatMonthLabel(date),
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

function buildMonthlyTrendLabel(currentMonthCount: number, previousMonthCount: number) {
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
    return "Em analise";
}
