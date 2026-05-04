import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, MapPin, PawPrint, Phone, UserRound } from "lucide-react";
import { AdminLayout } from "@/modules/dashboard/AdminLayout";
import { Button, EntityPageHeader, EntityPageShell, EntitySectionCard, EntityStatsGrid } from "@/shared/components/ui";
import { subscribeAdopters } from "@/modules/adopters/services/service";
import { subscribeAnimals } from "@/modules/animals/services/service";
import { ANIMAL_DATA } from "@/modules/animals/constants/animalData";
import { createAdoption } from "@/modules/adoptions/services/service";
import { formatAddress, formatCPF, formatPhone } from "@/modules/adopters/utils/formatter";
import type { AdopterRecord } from "@/modules/adopters/types";
import type { AnimalRecord } from "@/modules/animals/types/types";

export function AdoptionsCreatePage() {
    const availableStatus = ANIMAL_DATA.status[0].value as AnimalRecord["status"];
    const navigate = useNavigate();
    const [adopters, setAdopters] = useState<AdopterRecord[]>([]);
    const [animals, setAnimals] = useState<AnimalRecord[]>([]);
    const [selectedAdopter, setSelectedAdopter] = useState("");
    const [selectedAnimal, setSelectedAnimal] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubA = subscribeAdopters((next) => setAdopters(next), (err) => console.error(err));
        const unsubB = subscribeAnimals((next) => setAnimals(next), (err) => console.error(err));

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAdopter || !selectedAnimal) return;

        setLoading(true);
        try {
            const adopter = adopters.find((a) => a.id === selectedAdopter)!;
            const animal = animals.find((a) => a.id === selectedAnimal)!;

            await createAdoption({
                adopterId: adopter.id,
                adopterName: adopter.name,
                animalId: animal.id,
                animalName: animal.name,
                notes,
            });

            navigate("/adocoes/lista");
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Bonny | Registro de adoção</title>
            </Helmet>

            <AdminLayout>
                <EntityPageShell maxWidth="6xl">
                    <EntityPageHeader
                        eyebrow="Adoções"
                        title="Registrar adoção"
                        description="Associe adotante e animal, adicione contexto e conclua o registro."
                        action={
                            <button
                                type="button"
                                onClick={() => navigate("/adocoes/lista")}
                                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 shadow-sm transition-colors hover:bg-orange-50 md:w-auto dark:border-gray-700 dark:bg-slate-900 dark:text-orange-300 dark:hover:bg-slate-800"
                            >
                                Ver adoções
                            </button>
                        }
                    />

                    <EntityStatsGrid
                        items={[
                            { label: "Adotantes", value: adopters.length },
                            { label: "Animais aptos", value: availableAnimals.length },
                            { label: "Status do envio", value: isReadyToSubmit ? "Pronto" : "Pendente" },
                        ]}
                    />

                    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.95fr)]">
                        <div className="space-y-6">
                            <EntitySectionCard className="space-y-5">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
                                        Associação
                                    </p>
                                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-950 dark:text-white">
                                        Vincule adotante e animal
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Selecione os dois registros principais para liberar a conclusão da adoção.
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Adotante</span>
                                        <select
                                            value={selectedAdopter}
                                            onChange={(e) => setSelectedAdopter(e.target.value)}
                                            className="min-h-12 w-full appearance-none rounded-2xl border border-orange-100 bg-white px-4 py-3 pr-10 text-sm text-gray-700 shadow-sm outline-none transition-shadow focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 dark:border-orange-500/10 dark:bg-slate-900 dark:text-white"
                                            required
                                        >
                                            <option value="">Selecione um adotante</option>
                                            {adopters.map((adopter) => (
                                                <option key={adopter.id} value={adopter.id}>
                                                    {adopter.name} - {formatCPF(adopter.cpf)}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Animal disponível</span>
                                        <select
                                            value={selectedAnimal}
                                            onChange={(e) => setSelectedAnimal(e.target.value)}
                                            className="min-h-12 w-full appearance-none rounded-2xl border border-orange-100 bg-white px-4 py-3 pr-10 text-sm text-gray-700 shadow-sm outline-none transition-shadow focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 dark:border-orange-500/10 dark:bg-slate-900 dark:text-white"
                                            required
                                        >
                                            <option value="">Selecione um animal</option>
                                            {availableAnimals.map((animal) => (
                                                <option key={animal.id} value={animal.id}>
                                                    {animal.name} - {animal.species} / {animal.breed}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                            </EntitySectionCard>

                            <EntitySectionCard className="space-y-5">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
                                        Contexto
                                    </p>
                                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-gray-950 dark:text-white">
                                        Observações da adoção
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Registre informações complementares, se necessário.
                                    </p>
                                </div>

                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Observações</span>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="min-h-32 rounded-3xl border border-orange-100 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm outline-none transition-shadow placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 dark:border-orange-500/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-gray-500"
                                        placeholder="Informações complementares sobre a adoção"
                                    />
                                </label>

                                <div className="flex flex-col gap-3 border-t border-orange-100 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-orange-500/10">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Ao concluir, o animal passa automaticamente para adotado.
                                    </p>

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                                            Cancelar
                                        </Button>
                                        <Button type="submit" variant="primary" isLoading={loading} disabled={loading || !isReadyToSubmit}>
                                            Registrar adoção
                                        </Button>
                                    </div>
                                </div>
                            </EntitySectionCard>
                        </div>

                        <aside className="space-y-6">
                            <EntitySectionCard className="space-y-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
                                        Resumo
                                    </p>
                                    <h3 className="mt-2 text-lg font-semibold text-gray-950 dark:text-white">
                                        Conferência rápida
                                    </h3>
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
                                                {isReadyToSubmit ? "Os dados essenciais já foram selecionados." : "Escolha adotante e animal para liberar o envio."}
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
                                                <p>{selectedAnimalObj.species} • {selectedAnimalObj.breed}</p>
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
