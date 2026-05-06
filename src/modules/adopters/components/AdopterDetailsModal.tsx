import { CalendarClock, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
import { Modal } from "@/shared/components/ui";
import { formatAddress, formatCPF, formatDateTime, formatPhone } from "../utils/formatter";
import type { AdopterRecord } from "../types";
import { AdopterStatusBadge } from "./AdopterStatusBadge";

interface AdopterDetailsModalProps {
    adopter: AdopterRecord | null;
    onClose: () => void;
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

export function AdopterDetailsModal({ adopter, onClose }: AdopterDetailsModalProps) {
    if (!adopter) return null;

    return (
        <Modal
            open={!!adopter}
            title={adopter.name}
            description="Detalhes completos do cadastro do adotante."
            onClose={onClose}
            maxWidthClassName="max-w-5xl"
            bodyClassName="p-4 sm:p-6"
        >
            <div className="space-y-5">
                <div className="rounded-[28px] border border-orange-100/70 bg-gradient-to-br from-orange-50/80 to-white p-5 dark:border-slate-700/60 dark:from-slate-900 dark:to-slate-950 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                            <div className="rounded-2xl border border-orange-200/70 bg-white p-3 text-orange-500 shadow-sm dark:border-orange-500/20 dark:bg-slate-900 dark:text-orange-300">
                                <UserRound className="h-6 w-6" />
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">{adopter.name}</h3>
                                    <AdopterStatusBadge status={adopter.status} />
                                </div>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Cadastro de adotante</p>
                            </div>
                        </div>

                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                            <ShieldCheck className="h-3.5 w-3.5 text-orange-500" />
                            {adopter.status}
                        </span>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailItem label="CPF" value={formatCPF(adopter.cpf)} icon={UserRound} />
                    <DetailItem label="E-mail" value={adopter.email} icon={Mail} />
                    <DetailItem label="Telefone" value={formatPhone(adopter.phone)} icon={Phone} />
                    <DetailItem label="Endereço" value={formatAddress(adopter)} icon={MapPin} />
                    <DetailItem label="Criado em" value={formatDateTime(adopter.createdAt)} icon={CalendarClock} />
                    <DetailItem
                        label="Atualizado em"
                        value={adopter.updatedAt ? formatDateTime(adopter.updatedAt) : "Sem atualização"}
                        icon={CalendarClock}
                    />
                </div>

                <div className="rounded-[28px] border border-orange-100/70 bg-white/85 p-5 dark:border-slate-700/60 dark:bg-slate-900/80">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Observações</p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700 dark:text-gray-300">
                        {adopter.notes?.trim() ? adopter.notes : "Sem observações registradas."}
                    </p>
                </div>
            </div>
        </Modal>
    );
}
