import { useDeferredValue, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, PawPrint, Search, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { AdoptionRecord } from "@/modules/adoptions/services/service";
import type { AdopterRecord } from "@/modules/adopters/types";
import type { AnimalRecord } from "@/modules/animals/types/types";
import { getAnimalCodeLabel } from "@/modules/animals/utils/code";

interface DashboardGlobalSearchProps {
    animals: AnimalRecord[];
    adopters: AdopterRecord[];
    adoptions: AdoptionRecord[];
}

interface SearchResultItem {
    id: string;
    kind: "animal" | "adopter" | "adoption";
    title: string;
    subtitle: string;
    query: string;
    route: string;
}

interface SearchSection {
    kind: SearchResultItem["kind"];
    label: string;
    route: string;
    total: number;
    items: SearchResultItem[];
}

const MAX_RESULTS_PER_SECTION = 3;

function normalizeText(value: string) {
    return value.trim().toLowerCase();
}

function iconForKind(kind: SearchResultItem["kind"]) {
    if (kind === "animal") return PawPrint;
    if (kind === "adopter") return UserRound;
    return BadgeCheck;
}

function labelForKind(kind: SearchResultItem["kind"]) {
    if (kind === "animal") return "Animais";
    if (kind === "adopter") return "Adotantes";
    return "Adocoes";
}

function buildAnimalResults(animals: AnimalRecord[], query: string): SearchResultItem[] {
    return animals
        .filter((animal) => [getAnimalCodeLabel(animal), animal.name, animal.species, animal.breed].some((value) => normalizeText(value).includes(query)))
        .map((animal) => ({
            id: animal.id,
            kind: "animal" as const,
            title: `${getAnimalCodeLabel(animal)} • ${animal.name}`,
            subtitle: `${animal.species} • ${animal.breed}`,
            query: animal.animalCode?.trim() || animal.name,
            route: "/animais/lista",
        }));
}

function buildAdopterResults(adopters: AdopterRecord[], query: string): SearchResultItem[] {
    return adopters
        .filter((adopter) => [adopter.name, adopter.email, adopter.phone, adopter.cpf].some((value) => normalizeText(value).includes(query)))
        .map((adopter) => ({
            id: adopter.id,
            kind: "adopter" as const,
            title: adopter.name,
            subtitle: `${adopter.email} • ${adopter.cpf}`,
            query: adopter.cpf || adopter.email || adopter.name,
            route: "/adotantes/lista",
        }));
}

function buildAdoptionResults(adoptions: AdoptionRecord[], query: string): SearchResultItem[] {
    return adoptions
        .filter((adoption) =>
            [adoption.id, adoption.animalCode ?? "", adoption.animalName, adoption.adopterName].some((value) => normalizeText(value).includes(query)),
        )
        .map((adoption) => ({
            id: adoption.id,
            kind: "adoption" as const,
            title: `${adoption.animalCode?.trim() || adoption.id} • ${adoption.animalName}`,
            subtitle: `Adotante: ${adoption.adopterName}`,
            query: adoption.animalCode?.trim() || adoption.id,
            route: "/adocoes/lista",
        }));
}

function buildSections(animals: AnimalRecord[], adopters: AdopterRecord[], adoptions: AdoptionRecord[], query: string): SearchSection[] {
    const animalResults = buildAnimalResults(animals, query);
    const adopterResults = buildAdopterResults(adopters, query);
    const adoptionResults = buildAdoptionResults(adoptions, query);

    return [
        {
            kind: "animal" as const,
            label: labelForKind("animal"),
            route: "/animais/lista",
            total: animalResults.length,
            items: animalResults.slice(0, MAX_RESULTS_PER_SECTION),
        },
        {
            kind: "adopter" as const,
            label: labelForKind("adopter"),
            route: "/adotantes/lista",
            total: adopterResults.length,
            items: adopterResults.slice(0, MAX_RESULTS_PER_SECTION),
        },
        {
            kind: "adoption" as const,
            label: labelForKind("adoption"),
            route: "/adocoes/lista",
            total: adoptionResults.length,
            items: adoptionResults.slice(0, MAX_RESULTS_PER_SECTION),
        },
    ].filter((section) => section.total > 0);
}

export function DashboardGlobalSearch({ animals, adopters, adoptions }: DashboardGlobalSearchProps) {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const deferredQuery = useDeferredValue(query);

    const sections = useMemo(() => {
        const normalizedQuery = normalizeText(deferredQuery);
        if (!normalizedQuery) return [];

        return buildSections(animals, adopters, adoptions, normalizedQuery);
    }, [adopters, adoptions, animals, deferredQuery]);

    const handleNavigate = (route: string, searchValue: string) => {
        navigate(`${route}?search=${encodeURIComponent(searchValue)}`);
        setQuery("");
    };

    return (
        <div className="relative rounded-[24px] border border-orange-100/70 bg-white/85 p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/80">
            <div className="mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">Busca global</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Encontre animal, adotante, adocao ou codigo em um unico campo.</p>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-950">
                <Search className="h-4 w-4 text-orange-500" />
                <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Ex.: A0001, Luna, Joao, CPF ou ID"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                />
            </label>

            {query.trim() ? (
                <div className="mt-3 space-y-4">
                    {sections.length > 0 ? (
                        sections.map((section) => (
                            <div key={section.kind} className="space-y-2">
                                <div className="flex items-center justify-between gap-3 px-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                                            {section.label}
                                        </p>
                                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                                            {section.total}
                                        </span>
                                    </div>

                                    {section.total > section.items.length ? (
                                        <button
                                            type="button"
                                            onClick={() => handleNavigate(section.route, query)}
                                            className="text-xs font-semibold text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-300 dark:hover:text-orange-200"
                                        >
                                            Ver todos
                                        </button>
                                    ) : null}
                                </div>

                                {section.items.map((result) => {
                                    const Icon = iconForKind(result.kind);

                                    return (
                                        <button
                                            key={`${result.kind}-${result.id}`}
                                            type="button"
                                            onClick={() => handleNavigate(result.route, result.query)}
                                            className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-left transition-colors hover:border-orange-200 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-950/70 dark:hover:border-orange-500/20 dark:hover:bg-slate-900"
                                        >
                                            <div className="flex min-w-0 items-start gap-3">
                                                <div className="rounded-xl bg-orange-100 p-2 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{result.title}</p>
                                                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{result.subtitle}</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
                            Nenhum resultado encontrado para essa busca.
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}
