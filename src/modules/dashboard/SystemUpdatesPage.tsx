import { FileText, Sparkles, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "./AdminLayout";
import { appendReadUpdateId, loadReadUpdateIds, persistReadUpdateIds } from "./systemUpdatesReadState";
import { subscribeSystemUpdates } from "./systemUpdatesService";
import { sortSystemUpdates, type SystemUpdateEntry } from "./systemUpdates";
import { formatDateTime, type AppDateValue } from "@/shared/utils/date";

type UpdateFilter = "all" | SystemUpdateEntry["kind"];

function getUniqueItems(items: string[]) {
    return items.filter((item, index) => items.indexOf(item) === index);
}

function formatPublishedDate(value: AppDateValue) {
    return formatDateTime(value, "Data nao informada");
}

function getKindLabel(kind: SystemUpdateEntry["kind"]) {
    if (kind === "feature") return "Novo recurso";
    if (kind === "improvement") return "Melhoria";
    return "Correcao";
}

function getOperationalNotes(update: SystemUpdateEntry) {
    const notes: string[] = [];
    const impactedAreas = getUniqueItems(update.impactedAreas);

    if (update.attentionNote) {
        notes.push(update.attentionNote);
    }

    if (impactedAreas.length > 0) {
        notes.push(`Areas com impacto direto nesta release: ${impactedAreas.join(", ")}.`);
    }

    if (update.kind === "feature") {
        notes.push("A equipe pode esperar novas capacidades no fluxo operacional, com etapas adicionais ja disponiveis no painel.");
    }

    if (update.kind === "improvement") {
        notes.push("Essa entrega melhora um fluxo ja existente, entao vale revisar o processo atual antes de orientar o time.");
    }

    if (update.kind === "fix") {
        notes.push("Essa entrega corrige comportamento do sistema, entao a validacao deve priorizar os cenarios que apresentavam erro.");
    }

    return getUniqueItems(notes);
}

function getDetailHighlights(update: SystemUpdateEntry) {
    const impactedAreas = getUniqueItems(update.impactedAreas);
    const details: string[] = [];

    if (impactedAreas.length > 0) {
        details.push(`Modulos afetados: ${impactedAreas.join(", ")}.`);
    }

    if (update.kind === "feature") {
        details.push("A release adiciona comportamento novo no sistema e pode exigir alinhamento rapido com a equipe.");
    }

    if (update.kind === "improvement") {
        details.push("A entrega refina uma area existente, com foco em fluidez de uso e reducao de atrito operacional.");
    }

    if (update.kind === "fix") {
        details.push("A entrega corrige falhas observadas anteriormente e reduz inconsistencias no fluxo afetado.");
    }

    details.push(...getUniqueItems(update.highlights).slice(0, 2));

    return getUniqueItems(details);
}

function isUpdateUnread(updateId: string, readUpdateIds: string[]) {
    return !readUpdateIds.includes(updateId);
}

function MobileUpdatesSkeleton() {
    return (
        <section className="space-y-4 lg:hidden">
            <div className="space-y-4 rounded-[26px] border border-slate-200/70 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-950/72">
                <div className="flex items-center justify-between gap-3">
                    <div className="h-4 w-36 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                    <div className="h-6 w-10 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                </div>

                <div className="-mx-1 flex gap-2 overflow-x-auto px-1">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-8 w-28 shrink-0 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70"
                        />
                    ))}
                </div>

                <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
                    {Array.from({ length: 2 }).map((_, index) => (
                        <div
                            key={index}
                            className="w-[17.5rem] shrink-0 animate-pulse rounded-[24px] border border-slate-200/70 bg-slate-100/90 p-4 dark:border-slate-700/60 dark:bg-slate-900/80"
                        >
                            <div className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                            <div className="mt-3 h-4 w-4/5 rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                            <div className="mt-2 h-4 w-3/5 rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                            <div className="mt-4 h-3 w-20 rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="flex gap-2">
                        <div className="h-7 w-28 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                        <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                    </div>
                    <div className="mt-4 h-7 w-4/5 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                    <div className="mt-2 h-3 w-32 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                    <div className="mt-4 space-y-2">
                        <div className="h-4 w-full animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                        <div className="h-4 w-11/12 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                        <div className="h-4 w-4/5 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                    </div>
                </div>

                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="rounded-[24px] border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/60"
                    >
                        <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                        <div className="mt-4 space-y-2.5">
                            <div className="h-16 animate-pulse rounded-2xl bg-slate-100/90 dark:bg-slate-900/80" />
                            <div className="h-16 animate-pulse rounded-2xl bg-slate-100/90 dark:bg-slate-900/80" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function DesktopUpdatesSkeleton() {
    return (
        <section className="hidden gap-6 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="space-y-4 rounded-[26px] border border-slate-200/70 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="flex items-center justify-between gap-3">
                    <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                    <div className="h-6 w-10 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                </div>

                <div className="flex flex-col gap-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-8 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70"
                        />
                    ))}
                </div>

                <div className="space-y-2.5">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="animate-pulse rounded-3xl border border-slate-200/70 bg-slate-100/90 p-4 dark:border-slate-700/60 dark:bg-slate-900/80"
                        >
                            <div className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                            <div className="mt-3 h-4 w-4/5 rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                            <div className="mt-2 h-4 w-3/5 rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                            <div className="mt-4 h-3 w-20 rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                        </div>
                    ))}
                </div>
            </aside>

            <section className="space-y-4">
                <div className="rounded-[26px] border border-slate-200/70 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="flex gap-2">
                        <div className="h-7 w-28 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                        <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                    </div>
                    <div className="mt-4 h-8 w-3/5 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                    <div className="mt-3 space-y-2">
                        <div className="h-4 w-full animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                        <div className="h-4 w-11/12 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, index) => (
                            <div
                                key={index}
                                className="rounded-[24px] border border-slate-200/70 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60"
                            >
                                <div className="h-4 w-44 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                                <div className="mt-4 space-y-2.5">
                                    <div className="h-16 animate-pulse rounded-2xl bg-slate-100/90 dark:bg-slate-900/80" />
                                    <div className="h-16 animate-pulse rounded-2xl bg-slate-100/90 dark:bg-slate-900/80" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, index) => (
                            <div
                                key={index}
                                className="rounded-[24px] border border-slate-200/70 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60"
                            >
                                <div className="h-4 w-36 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                                <div className="mt-4 space-y-2.5">
                                    <div className="h-12 animate-pulse rounded-2xl bg-slate-100/90 dark:bg-slate-900/80" />
                                    <div className="h-12 animate-pulse rounded-2xl bg-slate-100/90 dark:bg-slate-900/80" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </section>
    );
}

export function SystemUpdatesPage() {
    const [updates, setUpdates] = useState<SystemUpdateEntry[]>([]);
    const [selectedUpdateId, setSelectedUpdateId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<UpdateFilter>("all");
    const [readUpdateIds, setReadUpdateIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setReadUpdateIds(loadReadUpdateIds());
    }, []);

    useEffect(() => {
        const unsubscribe = subscribeSystemUpdates(
            (remoteUpdates) => {
                const sortedUpdates = sortSystemUpdates(remoteUpdates);
                setUpdates(sortedUpdates);
                setSelectedUpdateId((current) => current ?? sortedUpdates[0]?.id ?? null);
                setLoading(false);
                setError(null);
            },
            () => {
                setLoading(false);
                setError("Nao foi possivel carregar o historico de atualizacoes agora.");
            },
        );

        return unsubscribe;
    }, []);

    const filteredUpdates = useMemo(
        () => updates.filter((update) => activeFilter === "all" || update.kind === activeFilter),
        [activeFilter, updates],
    );

    const selectedUpdate = filteredUpdates.find((update) => update.id === selectedUpdateId) ?? filteredUpdates[0] ?? null;
    const operationalNotes = selectedUpdate ? getOperationalNotes(selectedUpdate) : [];
    const impactedAreas = selectedUpdate ? getUniqueItems(selectedUpdate.impactedAreas) : [];
    const detailedHighlights = selectedUpdate ? getDetailHighlights(selectedUpdate) : [];

    useEffect(() => {
        if (selectedUpdate || filteredUpdates.length === 0) return;
        setSelectedUpdateId(filteredUpdates[0].id);
    }, [filteredUpdates, selectedUpdate]);

    useEffect(() => {
        if (!selectedUpdate) return;

        setReadUpdateIds((current) => {
            const next = appendReadUpdateId(current, selectedUpdate.id);
            if (next !== current) {
                persistReadUpdateIds(next);
            }
            return next;
        });
    }, [selectedUpdate]);

    const filters: Array<{ value: UpdateFilter; label: string }> = [
        { value: "all", label: "Todos" },
        { value: "feature", label: "Novos recursos" },
        { value: "improvement", label: "Melhorias" },
        { value: "fix", label: "Correcao" },
    ];

    return (
        <>
            <Helmet>
                <title>Bonny | Historico de atualizacoes</title>
            </Helmet>

            <AdminLayout>
                <main className="min-h-screen px-3 py-4 sm:px-4 sm:py-5 md:px-8 md:py-10">
                    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
                        <section className="rounded-[28px] border border-orange-100/70 bg-white/88 p-4 shadow-[0_18px_42px_-34px_rgb(249_115_22/0.24)] dark:border-slate-700/50 dark:bg-slate-950/72 sm:p-6 md:p-7">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div className="max-w-3xl">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-orange-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 dark:border-orange-400/20 dark:bg-orange-500/10 dark:text-orange-200">
                                        Central de atualizacoes
                                    </div>
                                    <h1 className="mt-4 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-4xl">
                                        Historico de atualizacoes
                                    </h1>
                                    <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-[15px]">
                                        Consulte releases publicadas, acompanhe o que mudou no sistema e identifique impactos operacionais por modulo.
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[22rem]">
                                    <div className="rounded-2xl border border-orange-100/70 bg-white/85 px-4 py-3 dark:border-slate-700/60 dark:bg-slate-900/80">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">Releases</p>
                                        <p className="mt-2 text-sm font-medium text-gray-950 dark:text-white">{updates.length} registradas</p>
                                    </div>
                                    <div className="rounded-2xl border border-orange-100/70 bg-white/85 px-4 py-3 dark:border-slate-700/60 dark:bg-slate-900/80">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">Nao lidas</p>
                                        <p className="mt-2 text-sm font-medium text-gray-950 dark:text-white">
                                            {updates.filter((update) => isUpdateUnread(update.id, readUpdateIds)).length} pendentes
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4 lg:hidden">
                            {loading ? <MobileUpdatesSkeleton /> : (
                            <>
                            <div className="space-y-4 rounded-[26px] border border-slate-200/70 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-950/72">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                                        <Sparkles className="h-4 w-4" />
                                        Explorar releases
                                    </div>
                                    <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                                        {filteredUpdates.length}
                                    </span>
                                </div>

                                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                                    {filters.map((filter) => {
                                        const active = activeFilter === filter.value;

                                        return (
                                            <button
                                                key={filter.value}
                                                type="button"
                                                onClick={() => setActiveFilter(filter.value)}
                                                className={[
                                                    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                                                    active
                                                        ? "border-orange-300 bg-orange-100 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200"
                                                        : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400",
                                                ].join(" ")}
                                            >
                                                {filter.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
                                    {filteredUpdates.map((update) => {
                                        const active = update.id === selectedUpdate?.id;
                                        const isNew = isUpdateUnread(update.id, readUpdateIds);

                                        return (
                                            <button
                                                key={update.id}
                                                type="button"
                                                onClick={() => setSelectedUpdateId(update.id)}
                                                className={[
                                                    "w-[17.5rem] shrink-0 snap-start rounded-[24px] border px-4 py-3.5 text-left transition-colors",
                                                    active
                                                        ? "border-orange-300 bg-orange-50 text-slate-950 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-white"
                                                        : "border-slate-200/70 bg-slate-50 text-slate-600 dark:border-slate-700/60 dark:bg-slate-900/80 dark:text-slate-300",
                                                ].join(" ")}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-600 dark:text-orange-300">
                                                                Release {update.version}
                                                            </p>
                                                            <span className="rounded-full border border-current/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] opacity-80">
                                                                {getKindLabel(update.kind)}
                                                            </span>
                                                        </div>
                                                        <h2 className="mt-1.5 line-clamp-2 break-words text-sm font-semibold leading-6">{update.title}</h2>
                                                    </div>
                                                    {isNew ? (
                                                        <span className="shrink-0 rounded-full border border-emerald-300/70 bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                                                            Novo
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className="mt-1.5 text-xs opacity-70">{formatPublishedDate(update.publishedAt)}</p>
                                                <p className="mt-2 line-clamp-2 break-words text-sm leading-6 opacity-85">{update.summary}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <section className="min-w-0">
                                {error ? (
                                    <div className="rounded-[26px] border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                                        {error}
                                    </div>
                                ) : selectedUpdate ? (
                                    <div className="space-y-4">
                                        <div className="rounded-[28px] border border-orange-100/70 bg-orange-50/85 p-4 dark:border-orange-500/10 dark:bg-orange-500/10">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full border border-orange-200 bg-orange-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
                                                    Release {selectedUpdate.version}
                                                </span>
                                                <span className="rounded-full border border-current/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
                                                    {getKindLabel(selectedUpdate.kind)}
                                                </span>
                                            </div>

                                            <h2 className="mt-4 break-words text-[1.45rem] font-semibold tracking-tight text-slate-950 dark:text-white">
                                                {selectedUpdate.title}
                                            </h2>
                                            <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                Publicado em {formatPublishedDate(selectedUpdate.publishedAt)}
                                            </p>
                                            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                                                {selectedUpdate.summary}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="rounded-[24px] border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/60">
                                                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                                                    <Sparkles className="h-4 w-4 text-orange-500" />
                                                    Destaques da release
                                                </div>
                                                <div className="space-y-2.5">
                                                    {detailedHighlights.map((highlight) => (
                                                        <div
                                                            key={highlight}
                                                            className="rounded-2xl border border-orange-100/70 bg-orange-50/60 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-orange-500/10 dark:bg-orange-500/10 dark:text-slate-200"
                                                        >
                                                            {highlight}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="rounded-[24px] border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/60">
                                                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                                                    <FileText className="h-4 w-4 text-orange-500" />
                                                    O que a ONG precisa saber
                                                </div>
                                                <div className="space-y-2.5">
                                                    {operationalNotes.map((item) => (
                                                        <div
                                                            key={item}
                                                            className="rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
                                                        >
                                                            {item}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="rounded-[24px] border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/60">
                                                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                                                    <Wrench className="h-4 w-4 text-orange-500" />
                                                    Areas impactadas
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {impactedAreas.map((area) => (
                                                        <span
                                                            key={area}
                                                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                                                        >
                                                            {area}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {selectedUpdate.attentionNote && !operationalNotes.includes(selectedUpdate.attentionNote) ? (
                                                <div className="rounded-[24px] border border-blue-200/70 bg-blue-50/70 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                                                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                                                        <FileText className="h-4 w-4 text-blue-500" />
                                                        Observacao para a equipe
                                                    </div>
                                                    <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">
                                                        {selectedUpdate.attentionNote}
                                                    </p>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid min-h-[22rem] place-items-center rounded-[26px] border border-slate-200/70 bg-white/80 px-4 text-center dark:border-slate-800 dark:bg-slate-950/60">
                                        <div>
                                            <p className="text-base font-semibold text-slate-950 dark:text-white">Nenhuma release publicada.</p>
                                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                                Quando novas atualizacoes forem adicionadas no Firebase, elas aparecerao aqui.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </section>
                            </>
                            )}
                        </section>

                        {loading ? <DesktopUpdatesSkeleton /> : (
                        <section className="hidden gap-6 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
                            <aside className="space-y-4 rounded-[26px] border border-slate-200/70 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                                        <Sparkles className="h-4 w-4" />
                                        Releases
                                    </div>
                                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                                        {filteredUpdates.length}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {filters.map((filter) => {
                                        const active = activeFilter === filter.value;

                                        return (
                                            <button
                                                key={filter.value}
                                                type="button"
                                                onClick={() => setActiveFilter(filter.value)}
                                                className={[
                                                    "rounded-full border px-3 py-1.5 text-left text-xs font-semibold transition-colors",
                                                    active
                                                        ? "border-orange-300 bg-orange-100 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200"
                                                        : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400",
                                                ].join(" ")}
                                            >
                                                {filter.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="space-y-2.5">
                                    {filteredUpdates.map((update) => {
                                        const active = update.id === selectedUpdate?.id;
                                        const isNew = isUpdateUnread(update.id, readUpdateIds);

                                        return (
                                            <button
                                                key={update.id}
                                                type="button"
                                                onClick={() => setSelectedUpdateId(update.id)}
                                                className={[
                                                    "w-full rounded-3xl border px-3.5 py-3 text-left transition-colors",
                                                    active
                                                        ? "border-orange-300 bg-orange-50 text-slate-950 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-white"
                                                        : "border-slate-200/70 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50/60 dark:border-slate-700/60 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:border-orange-500/20 dark:hover:bg-slate-900",
                                                ].join(" ")}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-600 dark:text-orange-300">
                                                            Release {update.version}
                                                        </p>
                                                        <h2 className="mt-1.5 line-clamp-2 break-words text-sm font-semibold leading-6">{update.title}</h2>
                                                    </div>
                                                    {isNew ? (
                                                        <span className="shrink-0 rounded-full border border-emerald-300/70 bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                                                            Novo
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className="mt-2 line-clamp-2 break-words text-sm leading-6 opacity-85">{update.summary}</p>
                                                <p className="mt-2 text-xs opacity-70">{formatPublishedDate(update.publishedAt)}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </aside>

                            <section className="min-w-0">
                                {error ? (
                                    <div className="rounded-[26px] border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                                        {error}
                                    </div>
                                ) : selectedUpdate ? (
                                    <div className="space-y-4">
                                        <div className="rounded-[26px] border border-orange-100/70 bg-orange-50/80 p-5 dark:border-orange-500/10 dark:bg-orange-500/10 sm:p-6">
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                                <span className="rounded-full border border-orange-200 bg-orange-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
                                                    Release {selectedUpdate.version}
                                                </span>
                                                <span className="rounded-full border border-current/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
                                                    {getKindLabel(selectedUpdate.kind)}
                                                </span>
                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    Publicado em {formatPublishedDate(selectedUpdate.publishedAt)}
                                                </span>
                                            </div>

                                            <h2 className="mt-4 break-words text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                                                {selectedUpdate.title}
                                            </h2>
                                            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                                                {selectedUpdate.summary}
                                            </p>
                                        </div>

                                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                                            <div className="space-y-4">
                                                <div className="rounded-[24px] border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/60 sm:p-5">
                                                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                                                        <Sparkles className="h-4 w-4 text-orange-500" />
                                                        Destaques da release
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        {detailedHighlights.map((highlight) => (
                                                            <div
                                                                key={highlight}
                                                                className="rounded-2xl border border-orange-100/70 bg-orange-50/60 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-orange-500/10 dark:bg-orange-500/10 dark:text-slate-200"
                                                            >
                                                                {highlight}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="rounded-[24px] border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/60 sm:p-5">
                                                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                                                        <FileText className="h-4 w-4 text-orange-500" />
                                                        O que a ONG precisa saber
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        {operationalNotes.map((item) => (
                                                            <div
                                                                key={item}
                                                                className="rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
                                                            >
                                                                {item}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="rounded-[24px] border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/60 sm:p-5">
                                                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                                                        <Wrench className="h-4 w-4 text-orange-500" />
                                                        Areas impactadas
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {impactedAreas.map((area) => (
                                                            <span
                                                                key={area}
                                                                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                                                            >
                                                                {area}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {selectedUpdate.attentionNote && !operationalNotes.includes(selectedUpdate.attentionNote) ? (
                                                    <div className="rounded-[24px] border border-blue-200/70 bg-blue-50/70 p-4 dark:border-blue-500/20 dark:bg-blue-500/10 sm:p-5">
                                                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                                                            <FileText className="h-4 w-4 text-blue-500" />
                                                            Observacao para a equipe
                                                        </div>
                                                        <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">
                                                            {selectedUpdate.attentionNote}
                                                        </p>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid min-h-[22rem] place-items-center rounded-[26px] border border-slate-200/70 bg-white/80 px-4 text-center dark:border-slate-800 dark:bg-slate-950/60">
                                        <div>
                                            <p className="text-base font-semibold text-slate-950 dark:text-white">Nenhuma release publicada.</p>
                                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                                Quando novas atualizacoes forem adicionadas no Firebase, elas aparecerao aqui.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </section>
                        )}
                    </div>
                </main>
            </AdminLayout>
        </>
    );
}
