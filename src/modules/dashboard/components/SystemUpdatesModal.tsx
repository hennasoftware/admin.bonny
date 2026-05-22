import { FileText, Sparkles, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/shared/components/ui";
import { formatDateTime, type AppDateValue } from "@/shared/utils/date";
import type { SystemUpdateEntry } from "../systemUpdates";

interface SystemUpdatesModalProps {
    open: boolean;
    updates: SystemUpdateEntry[];
    selectedUpdateId: string | null;
    readUpdateIds: string[];
    onSelectUpdate: (updateId: string) => void;
    onClose: () => void;
}

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

export function SystemUpdatesModal({
    open,
    updates,
    selectedUpdateId,
    readUpdateIds,
    onSelectUpdate,
    onClose,
}: SystemUpdatesModalProps) {
    const [activeFilter, setActiveFilter] = useState<UpdateFilter>("all");

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
        onSelectUpdate(filteredUpdates[0].id);
    }, [filteredUpdates, onSelectUpdate, selectedUpdate]);

    const filters: Array<{ value: UpdateFilter; label: string }> = [
        { value: "all", label: "Todos" },
        { value: "feature", label: "Novos recursos" },
        { value: "improvement", label: "Melhorias" },
        { value: "fix", label: "Correcao" },
    ];

    return (
        <Modal
            open={open}
            title="Historico de atualizacoes"
            description="Consulte releases publicadas e veja um resumo curto do que mudou no sistema."
            onClose={onClose}
            maxWidthClassName="max-w-6xl"
            bodyClassName="p-0"
        >
            <div className="grid max-h-[78vh] min-h-[26rem] grid-cols-1 md:min-h-[32rem] md:grid-cols-[280px_minmax(0,1fr)]">
                <aside className="border-b border-slate-200/70 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/30 sm:p-4 md:border-b-0 md:border-r">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                            <Sparkles className="h-4 w-4" />
                            Releases publicadas
                        </div>
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                            {filteredUpdates.length} itens
                        </span>
                    </div>

                    <div className="-mx-3 mb-4 flex gap-2 overflow-x-auto px-3 pb-1 md:mx-0 md:flex-wrap md:px-0">
                        {filters.map((filter) => {
                            const active = activeFilter === filter.value;

                            return (
                                <button
                                    key={filter.value}
                                    type="button"
                                    onClick={() => setActiveFilter(filter.value)}
                                    className={[
                                        "shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
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

                    <div className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-1 md:mx-0 md:block md:space-y-2.5 md:overflow-visible md:px-0">
                        {filteredUpdates.map((update) => {
                            const active = update.id === selectedUpdate?.id;
                            const isNew = isUpdateUnread(update.id, readUpdateIds);

                            return (
                                <button
                                    key={update.id}
                                    type="button"
                                    onClick={() => onSelectUpdate(update.id)}
                                    className={[
                                        "w-[17rem] shrink-0 cursor-pointer snap-start rounded-3xl border px-3.5 py-3 text-left transition-colors md:w-full",
                                        active
                                            ? "border-orange-300 bg-orange-50 text-slate-950 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-white"
                                            : "border-slate-200/70 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50/60 dark:border-slate-700/60 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:border-orange-500/20 dark:hover:bg-slate-900",
                                    ].join(" ")}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-600 dark:text-orange-300">
                                                Release {update.version}
                                            </p>
                                            <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-6">{update.title}</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {isNew ? (
                                                <span className="w-fit rounded-full border border-emerald-300/70 bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                                                    Novo
                                                </span>
                                            ) : null}
                                            <span className="w-fit rounded-full border border-current/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] opacity-80">
                                                {getKindLabel(update.kind)}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="mt-2 line-clamp-2 text-sm leading-6 opacity-85">{update.summary}</p>
                                    <p className="mt-2 text-xs opacity-70">{formatPublishedDate(update.publishedAt)}</p>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                <section className="overflow-y-auto p-3 sm:p-5 md:p-6">
                    {selectedUpdate ? (
                        <div className="space-y-4 sm:space-y-5">
                            <div className="rounded-[24px] border border-orange-100/70 bg-orange-50/80 p-4 dark:border-orange-500/10 dark:bg-orange-500/10 sm:rounded-[28px] sm:p-5">
                                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                                    <span className="rounded-full border border-orange-200 bg-orange-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
                                        Release {selectedUpdate.version}
                                    </span>
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                        Publicado em {formatPublishedDate(selectedUpdate.publishedAt)}
                                    </span>
                                </div>

                                <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                                    {selectedUpdate.title}
                                </h3>
                                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:leading-7">
                                    {selectedUpdate.summary}
                                </p>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                                <div className="space-y-4">
                                    <div className="rounded-[22px] border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/60 sm:rounded-[24px] sm:p-5">
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                                                <Sparkles className="h-4 w-4 text-orange-500" />
                                                Destaques da release
                                            </div>
                                            {isUpdateUnread(selectedUpdate.id, readUpdateIds) ? (
                                                <span className="rounded-full border border-emerald-300/70 bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                                                    Novo
                                                </span>
                                            ) : null}
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

                                    <div className="rounded-[22px] border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/60 sm:rounded-[24px] sm:p-5">
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
                                    <div className="rounded-[22px] border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/60 sm:rounded-[24px] sm:p-5">
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
                                        <div className="rounded-[22px] border border-blue-200/70 bg-blue-50/70 p-4 dark:border-blue-500/20 dark:bg-blue-500/10 sm:rounded-[24px] sm:p-5">
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
                        <div className="grid h-full min-h-[20rem] place-items-center px-4 text-center">
                            <div>
                                <p className="text-base font-semibold text-slate-950 dark:text-white">Nenhuma release publicada.</p>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    Quando novas atualizacoes forem adicionadas no Firebase, elas aparecerao aqui.
                                </p>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </Modal>
    );
}
