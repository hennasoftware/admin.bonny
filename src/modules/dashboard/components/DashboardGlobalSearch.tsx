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

function normalizeText(value: string) {
    return value.trim().toLowerCase();
}

function buildAnimalSearch(animals: AnimalRecord[], query: string): SearchResultItem[] {
    return animals
        .filter((animal) => [getAnimalCodeLabel(animal), animal.name, animal.species, animal.breed].some((value) => normalizeText(value).includes(query)))
        .slice(0, 3)
        .map((animal) => ({
            id: animal.id,
            kind: "animal",
            title: `${getAnimalCodeLabel(animal)} • ${animal.name}`,
            subtitle: `${animal.species} • ${animal.breed}`,
            query: animal.animalCode?.trim() || animal.name,
            route: "/animais/lista",
        }));
}

function buildAdopterSearch(adopters: AdopterRecord[], query: string): SearchResultItem[] {
    return adopters
        .filter((adopter) => [adopter.name, adopter.email, adopter.phone, adopter.cpf].some((value) => normalizeText(value).includes(query)))
        .slice(0, 3)
        .map((adopter) => ({
            id: adopter.id,
            kind: "adopter",
            title: adopter.name,
            subtitle: `${adopter.email} • ${adopter.cpf}`,
            query: adopter.cpf || adopter.email || adopter.name,
            route: "/adotantes/lista",
        }));
}

function buildAdoptionSearch(adoptions: AdoptionRecord[], query: string): SearchResultItem[] {
    return adoptions
        .filter((adoption) =>
            [adoption.id, adoption.animalCode ?? "", adoption.animalName, adoption.adopterName].some((value) => normalizeText(value).includes(query)),
        )
        .slice(0, 3)
        .map((adoption) => ({
            id: adoption.id,
            kind: "adoption",
            title: `${adoption.animalCode?.trim() || adoption.id} • ${adoption.animalName}`,
            subtitle: `Adotante: ${adoption.adopterName}`,
            query: adoption.animalCode?.trim() || adoption.id,
            route: "/adocoes/lista",
        }));
}

function iconForKind(kind: SearchResultItem["kind"]) {
    if (kind === "animal") return PawPrint;
    if (kind === "adopter") return UserRound;
    return BadgeCheck;
}

function labelForKind(kind: SearchResultItem["kind"]) {
    if (kind === "animal") return "Animal";
    if (kind === "adopter") return "Adotante";
    return "Adocao";
}

export function DashboardGlobalSearch({ animals, adopters, adoptions }: DashboardGlobalSearchProps) {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const deferredQuery = useDeferredValue(query);

    const results = useMemo(() => {
        const normalizedQuery = normalizeText(deferredQuery);
        if (!normalizedQuery) return [];

        return [...buildAnimalSearch(animals, normalizedQuery), ...buildAdopterSearch(adopters, normalizedQuery), ...buildAdoptionSearch(adoptions, normalizedQuery)].slice(0, 8);
    }, [adopters, adoptions, animals, deferredQuery]);

    const handleNavigate = (result: SearchResultItem) => {
        navigate(`${result.route}?search=${encodeURIComponent(result.query)}`);
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
                <div className="mt-3 space-y-2">
                    {results.length > 0 ? (
                        results.map((result) => {
                            const Icon = iconForKind(result.kind);

                            return (
                                <button
                                    key={`${result.kind}-${result.id}`}
                                    type="button"
                                    onClick={() => handleNavigate(result)}
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
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                                        <span>{labelForKind(result.kind)}</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </div>
                                </button>
                            );
                        })
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
