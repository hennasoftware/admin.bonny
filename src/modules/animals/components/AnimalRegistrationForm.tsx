import { useState, type FormEvent } from "react";
import { PawPrint, TextCursorInput, Droplets } from "lucide-react";
import { Button, FormField } from "@/shared/components/ui";
import type { AnimalFormState, AnimalRecord } from "../types";

interface AnimalRegistrationFormProps {
    onCreate: (animal: AnimalRecord) => void;
}

const defaultFormState: AnimalFormState = {
    name: "",
    species: "",
    breed: "",
    sex: "Desconhecido",
    age: "",
    size: "Médio",
    color: "",
    status: "Disponível",
    neutered: false,
    vaccinated: false,
    notes: "",
};

function nextAnimalId() {
    return `ANM-${Math.floor(1000 + Math.random() * 9000)}`;
}

function currentTimeLabel() {
    return new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date());
}

export function AnimalRegistrationForm({ onCreate }: AnimalRegistrationFormProps) {
    const [form, setForm] = useState<AnimalFormState>(defaultFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof AnimalFormState, string>>>({});

    const updateField = <K extends keyof AnimalFormState>(field: K, value: AnimalFormState[K]) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const validate = () => {
        const nextErrors: Partial<Record<keyof AnimalFormState, string>> = {};

        if (!form.name.trim()) nextErrors.name = "Informe o nome.";
        if (!form.species.trim()) nextErrors.species = "Informe a espécie.";
        if (!form.breed.trim()) nextErrors.breed = "Informe a raça.";
        if (!form.age.trim()) nextErrors.age = "Informe a idade estimada.";
        if (!form.color.trim()) nextErrors.color = "Informe a cor.";

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);

        const newAnimal: AnimalRecord = {
            id: nextAnimalId(),
            name: form.name.trim(),
            species: form.species.trim(),
            breed: form.breed.trim(),
            sex: form.sex,
            age: form.age.trim(),
            size: form.size,
            color: form.color.trim(),
            status: form.status,
            neutered: form.neutered,
            vaccinated: form.vaccinated,
            notes: form.notes.trim() || undefined,
            createdAt: currentTimeLabel(),
        };

        onCreate(newAnimal);
        setForm(defaultFormState);
        setErrors({});
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-orange-100 bg-white/92 p-6 shadow-sm dark:border-orange-500/10 dark:bg-slate-900/88 md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
                        Cadastro
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
                        Novo animal
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Comece pelo cadastro para organizar o fluxo de adoção.
                    </p>
                </div>

                <div className="hidden rounded-2xl bg-orange-50 p-3 text-orange-500 dark:bg-orange-500/10 dark:text-orange-300 md:flex">
                    <PawPrint className="h-6 w-6" />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <FormField
                    label="Nome do animal"
                    placeholder="Ex.: Luna"
                    icon={PawPrint}
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    error={errors.name}
                />

                <FormField
                    label="Espécie"
                    placeholder="Ex.: Cachorro"
                    icon={TextCursorInput}
                    value={form.species}
                    onChange={(event) => updateField("species", event.target.value)}
                    error={errors.species}
                />

                <FormField
                    label="Raça"
                    placeholder="Ex.: Vira-lata"
                    icon={TextCursorInput}
                    value={form.breed}
                    onChange={(event) => updateField("breed", event.target.value)}
                    error={errors.breed}
                />

                <FormField
                    label="Idade estimada"
                    placeholder="Ex.: 2 anos"
                    icon={TextCursorInput}
                    value={form.age}
                    onChange={(event) => updateField("age", event.target.value)}
                    error={errors.age}
                />

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sexo</span>
                    <select
                        value={form.sex}
                        onChange={(event) => updateField("sex", event.target.value as AnimalFormState["sex"])}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 outline-none transition-[box-shadow] duration-150 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-orange-400 dark:focus:ring-orange-400/50"
                    >
                        <option>Macho</option>
                        <option>Fêmea</option>
                        <option>Desconhecido</option>
                    </select>
                </label>

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Porte</span>
                    <select
                        value={form.size}
                        onChange={(event) => updateField("size", event.target.value as AnimalFormState["size"])}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 outline-none transition-[box-shadow] duration-150 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-orange-400 dark:focus:ring-orange-400/50"
                    >
                        <option>Pequeno</option>
                        <option>Médio</option>
                        <option>Grande</option>
                        <option>Gigante</option>
                    </select>
                </label>

                <FormField
                    label="Cor"
                    placeholder="Ex.: Caramelo"
                    icon={Droplets}
                    value={form.color}
                    onChange={(event) => updateField("color", event.target.value)}
                    error={errors.color}
                />

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                    <select
                        value={form.status}
                        onChange={(event) => updateField("status", event.target.value as AnimalFormState["status"])}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 outline-none transition-[box-shadow] duration-150 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-orange-400 dark:focus:ring-orange-400/50"
                    >
                        <option>Disponível</option>
                        <option>Em processo</option>
                        <option>Adotado</option>
                    </select>
                </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                    <input
                        type="checkbox"
                        checked={form.neutered}
                        onChange={(event) => updateField("neutered", event.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Castrado</span>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                    <input
                        type="checkbox"
                        checked={form.vaccinated}
                        onChange={(event) => updateField("vaccinated", event.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Vacinado</span>
                </label>
            </div>

            <label className="mt-4 flex flex-col gap-1.5">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Observações</span>
                <textarea
                    value={form.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    placeholder="Comportamento, saúde, preferências, restrições..."
                    rows={4}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-[box-shadow] duration-150 placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-orange-400 dark:focus:ring-orange-400/50"
                />
            </label>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Campos principais são obrigatórios para salvar o cadastro.
                </p>

                <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} variant="primary">
                    Cadastrar animal
                </Button>
            </div>
        </form>
    );
}
