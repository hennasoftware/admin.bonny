import { CalendarClock, Cat, Dog, HeartPulse, ShieldCheck, Tag, UserRound } from "lucide-react";
import { Modal } from "@/shared/components/ui";
import { formatDateTime } from "../utils/formatter";
import type { AnimalRecord } from "../types/types";
import { AnimalStatusBadge } from "./AnimalStatusBadge";
import { formatAnimalAgeFromValue } from "../utils/age";

interface AnimalDetailsModalProps {
    animal: AnimalRecord | null;
    onClose: () => void;
}

function speciesIcon(species: string) {
    return species.toLowerCase().includes("gato") ? Cat : Dog;
}

function DetailItem({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: typeof UserRound;
}) {
    return (
        <div className="rounded-2xl border border-orange-100/70 bg-white/85 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                <Icon className="h-4 w-4 text-orange-500 dark:text-orange-300" />
                {label}
            </div>
            <p className="mt-2 text-sm font-medium text-gray-950 dark:text-white">{value}</p>
        </div>
    );
}

export function AnimalDetailsModal({ animal, onClose }: AnimalDetailsModalProps) {
    if (!animal) return null;

    const SpeciesIcon = speciesIcon(animal.species);

    return (
        <Modal
            open={!!animal}
            title={animal.name}
            description="Detalhes completos do cadastro do animal."
            onClose={onClose}
            maxWidthClassName="max-w-5xl"
            bodyClassName="p-4 sm:p-6"
        >
            <div className="space-y-5">
                <div className="rounded-[28px] border border-orange-100/70 bg-gradient-to-br from-orange-50/80 to-white p-5 dark:border-slate-700/60 dark:from-slate-900 dark:to-slate-950 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                            <div className="rounded-2xl border border-orange-200/70 bg-white p-3 text-orange-500 shadow-sm dark:border-orange-500/20 dark:bg-slate-900 dark:text-orange-300">
                                <SpeciesIcon className="h-6 w-6" />
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">{animal.name}</h3>
                                    <AnimalStatusBadge status={animal.status} />
                                </div>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {animal.species} • {animal.breed}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                <HeartPulse className="h-3.5 w-3.5 text-orange-500" />
                                {animal.neutered ? "Castrado" : "Não castrado"}
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                <ShieldCheck className="h-3.5 w-3.5 text-sky-500" />
                                {animal.vaccinated ? "Vacinado" : "Vacina pendente"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailItem label="Espécie" value={animal.species} icon={Tag} />
                    <DetailItem label="Raça" value={animal.breed} icon={Tag} />
                    <DetailItem label="Sexo" value={animal.sex} icon={UserRound} />
                    <DetailItem label="Idade" value={formatAnimalAgeFromValue(animal.age)} icon={CalendarClock} />
                    <DetailItem label="Porte" value={animal.size} icon={Tag} />
                    <DetailItem label="Cor" value={animal.color} icon={Tag} />
                </div>

                <div className="rounded-[28px] border border-orange-100/70 bg-white/85 p-5 dark:border-slate-700/60 dark:bg-slate-900/80">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Observações</p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700 dark:text-gray-300">
                        {animal.notes?.trim() ? animal.notes : "Sem observações registradas."}
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <DetailItem label="Criado em" value={formatDateTime(animal.createdAt)} icon={CalendarClock} />
                    <DetailItem
                        label="Atualizado em"
                        value={animal.updatedAt ? formatDateTime(animal.updatedAt) : "Sem atualização"}
                        icon={CalendarClock}
                    />
                </div>
            </div>
        </Modal>
    );
}
