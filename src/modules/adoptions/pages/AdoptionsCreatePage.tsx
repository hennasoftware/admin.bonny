import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, MapPin, PawPrint, Phone, UserRound } from "lucide-react";
import { AdminLayout } from "@/modules/dashboard/AdminLayout";
import { Button, EntityAlert, EntityPageHeader, EntityPageShell, EntitySectionCard, EntityStatsGrid, useToast } from "@/shared/components/ui";
import { subscribeAdopters } from "@/modules/adopters/services/service";
import { subscribeAnimals } from "@/modules/animals/services/service";
import Select from "react-select";
import { useTheme } from "@/styles/themes/useTheme";
import { createSelectStyles } from "@/shared/utils/selectStyles";
import { ANIMAL_DATA } from "@/modules/animals/constants/animalData";
import { createAdoption, type AdoptionStatus } from "@/modules/adoptions/services/service";
import { formatAddress, formatCPF, formatPhone } from "@/modules/adopters/utils/formatter";
import type { AdopterRecord } from "@/modules/adopters/types";
import type { AnimalRecord } from "@/modules/animals/types/types";

export function AdoptionsCreatePage() {
    const availableStatus = ANIMAL_DATA.status[0].value as AnimalRecord["status"];
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [adopters, setAdopters] = useState<AdopterRecord[]>([]);
    const [animals, setAnimals] = useState<AnimalRecord[]>([]);
    const [selectedAdopter, setSelectedAdopter] = useState("");
    const [selectedAnimal, setSelectedAnimal] = useState("");
    const [adoptionStatus, setAdoptionStatus] = useState<AdoptionStatus>("Em analise");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { theme } = useTheme();

    useEffect(() => {
        const unsubA = subscribeAdopters(
            (next) => setAdopters(next.filter((adopter) => adopter.status === "Ativo")),
            (err) => setError(err.message),
        );
        const unsubB = subscribeAnimals(
            (next) => setAnimals(next),
            (err) => setError(err.message),
        );

        return () => {
            unsubA();
            unsubB();
        };
    }, []);

    const availableAnimals = useMemo(
        () => animals.filter((animal) => animal.status === availableStatus),
        [animals, availableStatus],
    );

    const selectedAdopterObj = adopters.find((adopter) => adopter.id === selectedAdopter) || null;
    const selectedAnimalObj = animals.find((animal) => animal.id === selectedAnimal) || null;
    const isReadyToSubmit = !!selectedAdopterObj && !!selectedAnimalObj;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!selectedAdopterObj || !selectedAnimalObj) return;

        setLoading(true);
        setError(null);

        try {
            await createAdoption({
                adopterId: selectedAdopterObj.id,
                adopterName: selectedAdopterObj.name,
                animalId: selectedAnimalObj.id,
                animalName: selectedAnimalObj.name,
                status: adoptionStatus,
                notes,
            });

            showToast("Adocao registrada com sucesso.");
            navigate("/adocoes/lista");
        } catch (submitError) {
            const message = submitError instanceof Error ? submitError.message : "Nao foi possivel registrar a adocao.";
            setError(message);
            showToast(message, "error");
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Bonny | Registro de adocao</title>
            </Helmet>

            <AdminLayout>
                <EntityPageShell maxWidth="6xl">
                    <EntityPageHeader
                        eyebrow="Adocoes"
                        title="Registrar adocao"
                        description="Associe adotante e animal, defina o status inicial e conclua o registro."
                        action={
                            <button
                                type="button"
                                onClick={() => navigate("/adocoes/lista")}
                                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 shadow-sm transition-colors hover:bg-orange-50 md:w-auto dark:border-gray-700 dark:bg-slate-900 dark:text-orange-300 dark:hover:bg-slate-800"
                            >
                                Ver adocoes
                            </button>
                        }
                    />

                    <EntityStatsGrid
                        items={[
                            { label: "Adotantes aptos", value: adopters.length },
                            { label: "Animais aptos", value: availableAnimals.length },
                            { label: "Status do envio", value: isReadyToSubmit ? "Pronto" : "Pendente" },
                        ]}
                    />

                    {error ? <EntityAlert tone="error">{error}</EntityAlert> : null}

                    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.95fr)]">
                        <div className="space-y-6">
                            <EntitySectionCard className="space-y-5">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">Associacao</p>
                                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-950 dark:text-white">Vincule adotante e animal</h2>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Apenas adotantes ativos e animais disponiveis aparecem nesta etapa.
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Adotante</span>
                                        <Select
                                            value={(() => {
                                                const opts = adopters
                                                    .map((a) => ({ value: a.id, label: `${a.name} - ${formatCPF(a.cpf)}` }))
                                                    .sort((x, y) => x.label.localeCompare(y.label));
                                                return opts.find((o) => o.value === selectedAdopter) ?? null;
                                            })()}
                                                onChange={(opt) => setSelectedAdopter((opt as any)?.value ?? "")}
                                                    options={adopters.map((a) => ({ value: a.id, label: `${a.name} - ${formatCPF(a.cpf)}` })).sort((x, y) => x.label.localeCompare(y.label))}
                                                    placeholder="Selecione um adotante"
                                                    isClearable
                                                    className="w-full"
                                                    menuPlacement="auto"
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                                                    styles={createSelectStyles("md", theme === "dark")}
                                                    classNames={{
                                                        control: () =>
                                                            "rounded-2xl border border-orange-100 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition-shadow focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 dark:border-orange-500/10 dark:bg-slate-900 dark:text-white",
                                                        valueContainer: () => "px-3",
                                                        singleValue: () => "text-sm",
                                                        placeholder: () => "text-gray-400",
                                                        menu: () => "mt-1 rounded-lg border border-gray-200 bg-white shadow-lg z-50 dark:border-gray-700 dark:bg-gray-800",
                                                        option: (s) => `px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ${s.isFocused ? "bg-slate-50 dark:bg-slate-900/60" : ""}`,
                                                    }}
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Animal disponivel</span>
                                        <Select
                                            value={(() => {
                                                const opts = availableAnimals
                                                    .map((a) => ({ value: a.id, label: `${a.name} - ${a.species} / ${a.breed}` }))
                                                    .sort((x, y) => x.label.localeCompare(y.label));
                                                return opts.find((o) => o.value === selectedAnimal) ?? null;
                                            })()}
                                            onChange={(opt) => setSelectedAnimal((opt as any)?.value ?? "")}
                                            options={availableAnimals.map((a) => ({ value: a.id, label: `${a.name} - ${a.species} / ${a.breed}` })).sort((x, y) => x.label.localeCompare(y.label))}
                                            placeholder="Selecione um animal"
                                            isClearable
                                            className="w-full"
                                            menuPlacement="auto"
                                            menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                                            styles={createSelectStyles("md", theme === "dark")}
                                            classNames={{
                                                    control: () =>
                                                    "rounded-2xl border border-orange-100 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition-shadow focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 dark:border-orange-500/10 dark:bg-slate-900 dark:text-white",
                                                valueContainer: () => "px-3",
                                                singleValue: () => "text-sm",
                                                placeholder: () => "text-gray-400",
                                                menu: () => "mt-1 rounded-lg border border-gray-200 bg-white shadow-lg z-50 dark:border-gray-700 dark:bg-gray-800",
                                                option: (s) => `px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ${s.isFocused ? "bg-slate-50 dark:bg-slate-900/60" : ""}`,
                                            }}
                                        />
                                    </label>
                                </div>

                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status inicial</span>
                                    <Select
                                        value={["Em analise", "Agendada", "Concluida"].map((v) => ({ value: v as AdoptionStatus, label: v })).sort((a, b) => a.label.localeCompare(b.label)).find((o) => o.value === adoptionStatus) ?? null}
                                        onChange={(opt) => setAdoptionStatus((opt as any)?.value ?? "Em analise")}
                                        options={["Em analise", "Agendada", "Concluida"].map((v) => ({ value: v as AdoptionStatus, label: v })).sort((a, b) => a.label.localeCompare(b.label))}
                                        isSearchable={false}
                                        className="w-full"
                                        styles={createSelectStyles("md", theme === "dark")}
                                        classNames={{
                                                control: () =>
                                                    "rounded-2xl border border-orange-100 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition-shadow focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 dark:border-orange-500/10 dark:bg-slate-900 dark:text-white",
                                            valueContainer: () => "px-3",
                                            singleValue: () => "text-sm",
                                            placeholder: () => "text-gray-400",
                                            menu: () => "mt-1 rounded-lg border border-gray-200 bg-white shadow-lg z-50 dark:border-gray-700 dark:bg-gray-800",
                                            option: (s) => `px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ${s.isFocused ? "bg-slate-50 dark:bg-slate-900/60" : ""}`,
                                        }}
                                    />
                                </label>
                            </EntitySectionCard>

                            <EntitySectionCard className="space-y-5">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">Contexto</p>
                                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-gray-950 dark:text-white">Observacoes da adocao</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Registre informacoes complementares, se necessario.</p>
                                </div>

                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Observacoes</span>
                                    <textarea
                                        value={notes}
                                        onChange={(event) => setNotes(event.target.value)}
                                        className="min-h-32 rounded-3xl border border-orange-100 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm outline-none transition-shadow placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 dark:border-orange-500/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-gray-500"
                                        placeholder="Informacoes complementares sobre a adocao"
                                    />
                                </label>

                                <div className="flex flex-col gap-3 border-t border-orange-100 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-orange-500/10">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Status em analise ou agendada mantem o animal em processo. Concluida finaliza a adocao.
                                    </p>

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                                            Cancelar
                                        </Button>
                                        <Button type="submit" variant="primary" isLoading={loading} disabled={loading || !isReadyToSubmit}>
                                            Registrar adocao
                                        </Button>
                                    </div>
                                </div>
                            </EntitySectionCard>
                        </div>

                        <aside className="space-y-6">
                            <EntitySectionCard className="space-y-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">Resumo</p>
                                    <h3 className="mt-2 text-lg font-semibold text-gray-950 dark:text-white">Conferencia rapida</h3>
                                </div>

                                <div className="rounded-3xl border border-orange-100 bg-orange-50/70 p-4 dark:border-orange-500/10 dark:bg-orange-500/5">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-white p-2 text-orange-600 shadow-sm dark:bg-slate-900 dark:text-orange-300">
                                            <BadgeCheck className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-950 dark:text-white">
                                                {isReadyToSubmit ? "Pronto para concluir" : "Complete os campos principais"}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {isReadyToSubmit ? "Os dados essenciais ja foram selecionados." : "Escolha adotante e animal para liberar o envio."}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="rounded-3xl border border-orange-100 p-4 dark:border-orange-500/10">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-950 dark:text-white">
                                            <UserRound className="h-4 w-4 text-orange-500" />
                                            Adotante
                                        </div>
                                        {selectedAdopterObj ? (
                                            <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                                <p className="font-semibold text-gray-950 dark:text-white">{selectedAdopterObj.name}</p>
                                                <p>CPF: {formatCPF(selectedAdopterObj.cpf)}</p>
                                                <div className="flex items-start gap-2">
                                                    <Phone className="mt-0.5 h-4 w-4 text-orange-500" />
                                                    <span>
                                                        {selectedAdopterObj.email}
                                                        <br />
                                                        {formatPhone(selectedAdopterObj.phone)}
                                                    </span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="mt-0.5 h-4 w-4 text-orange-500" />
                                                    <span>{formatAddress(selectedAdopterObj)}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Nenhum adotante selecionado.</p>
                                        )}
                                    </div>

                                    <div className="rounded-3xl border border-orange-100 p-4 dark:border-orange-500/10">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-950 dark:text-white">
                                            <PawPrint className="h-4 w-4 text-orange-500" />
                                            Animal
                                        </div>
                                        {selectedAnimalObj ? (
                                            <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                                <p className="font-semibold text-gray-950 dark:text-white">{selectedAnimalObj.name}</p>
                                                <p>
                                                    {selectedAnimalObj.species} • {selectedAnimalObj.breed}
                                                </p>
                                                <p>Porte: {selectedAnimalObj.size}</p>
                                                <p>Idade: {selectedAnimalObj.age}</p>
                                            </div>
                                        ) : (
                                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Nenhum animal selecionado.</p>
                                        )}
                                    </div>
                                </div>
                            </EntitySectionCard>
                        </aside>
                    </form>
                </EntityPageShell>
            </AdminLayout>
        </>
    );
}
