import { useEffect, useState, type FormEvent } from "react";
import { PawPrint } from "lucide-react";
import { Button, FormField } from "@/shared/components/ui";
import Select from "react-select";
import { createSelectStyles } from "@/shared/utils/selectStyles";
import { useTheme } from "@/styles/themes/useTheme";
import { ANIMAL_DATA } from "../constants/animalData";
import type { AnimalFormState } from "../types/types";

const defaultFormState: AnimalFormState = {
    name: "",
    species: "cachorro",
    breed: "",
    sex: "Desconhecido",
    age: "",
    size: "Medio",
    color: "",
    status: "Disponivel",
    neutered: false,
    vaccinated: false,
    notes: "",
};

interface AnimalFormProps {
    initialValues?: Partial<AnimalFormState>;
    onSubmit: (values: AnimalFormState) => Promise<void> | void;
    submitLabel: string;
    loading?: boolean;
    onCancel?: () => void;
    cancelLabel?: string;
}

export function AnimalForm({
    initialValues,
    onSubmit,
    submitLabel,
    loading = false,
    onCancel,
    cancelLabel = "Cancelar",
}: AnimalFormProps) {
    const [form, setForm] = useState<AnimalFormState>({ ...defaultFormState, ...initialValues });
    const [errors, setErrors] = useState<Partial<Record<keyof AnimalFormState, string>>>({});
    const { theme } = useTheme();

    const updateField = <K extends keyof AnimalFormState>(field: K, value: AnimalFormState[K]) => {
        setForm((current) => {
            const updated = { ...current, [field]: value };
            if (field === "species") updated.breed = "";
            return updated;
        });
    };

    const availableBreeds = ((ANIMAL_DATA.breeds[form.species as keyof typeof ANIMAL_DATA.breeds] || []) as readonly string[]).slice();

    useEffect(() => {
        if (form.breed && !availableBreeds.includes(form.breed)) {
            setForm((current) => ({ ...current, breed: "" }));
        }
    }, [availableBreeds, form.breed]);

    const validate = () => {
        const nextErrors: Partial<Record<keyof AnimalFormState, string>> = {};

        if (!form.name.trim()) nextErrors.name = "Informe o nome.";
        if (!form.species.trim()) nextErrors.species = "Informe a especie.";
        if (!form.breed.trim()) nextErrors.breed = "Informe a raca.";
        if (!form.age.trim()) nextErrors.age = "Informe a idade estimada.";
        if (!form.color.trim()) nextErrors.color = "Informe a cor.";

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validate()) return;

        await onSubmit({
            ...form,
            name: form.name.trim(),
            species: form.species.trim(),
            breed: form.breed.trim(),
            age: form.age.trim(),
            color: form.color.trim(),
            notes: form.notes.trim(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-4xl border border-orange-100 bg-white/92 p-6 shadow-sm dark:border-orange-500/10 dark:bg-slate-900/88 md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">Cadastro</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">Novo animal</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Comece pelo cadastro para organizar o fluxo de adocao.</p>
                </div>

                <div className="hidden rounded-2xl bg-orange-50 p-3 text-orange-500 dark:bg-orange-500/10 dark:text-orange-300 md:flex">
                    <PawPrint className="h-6 w-6" />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Nome do animal" placeholder="Ex.: Luna" icon={PawPrint} value={form.name} onChange={(event) => updateField("name", event.target.value)} error={errors.name} disabled={loading} />

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Especie</span>
                    <Select
                        value={ANIMAL_DATA.species
                            .map((s) => ({ value: s.value, label: s.label }))
                            .sort((a, b) => a.label.localeCompare(b.label))
                            .find((o) => o.value === form.species) ?? null}
                        onChange={(opt) => updateField("species", (opt as any)?.value ?? "")}
                        options={ANIMAL_DATA.species.map((s) => ({ value: s.value, label: s.label })).sort((a, b) => a.label.localeCompare(b.label))}
                        isDisabled={loading}
                        className="w-full"
                        menuPlacement="auto"
                        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                        styles={createSelectStyles("md", theme === "dark")}
                        classNames={{
                            control: () =>
                                "rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-shadow duration-150 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
                            valueContainer: () => "px-3",
                            singleValue: () => "text-sm",
                            placeholder: () => "text-gray-400",
                            menu: () => "mt-1 rounded-lg border border-gray-200 bg-white shadow-lg z-50 dark:border-gray-700 dark:bg-gray-800",
                            option: (s) => `px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ${s.isFocused ? "bg-slate-50 dark:bg-slate-900/60" : ""}`,
                        }}
                    />
                </label>

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Raca</span>
                    <Select
                        value={["", ...availableBreeds]
                            .filter(Boolean)
                            .map((b) => ({ value: b, label: b }))
                            .sort((a, b) => a.label.localeCompare(b.label))
                            .find((o) => o.value === form.breed) ?? null}
                        onChange={(opt) => updateField("breed", (opt as any)?.value ?? "")}
                        options={availableBreeds.map((b) => ({ value: b, label: b })).sort((a, b) => a.label.localeCompare(b.label))}
                        isDisabled={loading}
                        className="w-full"
                        menuPlacement="auto"
                        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                        styles={createSelectStyles("md", theme === "dark")}
                        placeholder="Selecione uma raca"
                        classNames={{
                            control: () =>
                                "rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-shadow duration-150 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
                            valueContainer: () => "px-3",
                            singleValue: () => "text-sm",
                            placeholder: () => "text-gray-400",
                            menu: () => "mt-1 rounded-lg border border-gray-200 bg-white shadow-lg z-50 dark:border-gray-700 dark:bg-gray-800",
                            option: (s) => `px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ${s.isFocused ? "bg-slate-50 dark:bg-slate-900/60" : ""}`,
                        }}
                    />
                    {errors.breed ? <p className="text-sm text-red-500 dark:text-red-400">{errors.breed}</p> : null}
                </label>

                <FormField label="Idade estimada" placeholder="Ex.: 2 anos" value={form.age} onChange={(event) => updateField("age", event.target.value)} error={errors.age} disabled={loading} />

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sexo</span>
                    <Select
                        value={ANIMAL_DATA.sex.map((s) => ({ value: s.value, label: s.label })).sort((a, b) => a.label.localeCompare(b.label)).find((o) => o.value === form.sex) ?? null}
                        onChange={(opt) => updateField("sex", (opt as any)?.value ?? "")}
                        options={ANIMAL_DATA.sex.map((s) => ({ value: s.value, label: s.label })).sort((a, b) => a.label.localeCompare(b.label))}
                        isDisabled={loading}
                        className="w-full"
                        menuPlacement="auto"
                        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                        styles={createSelectStyles("md", theme === "dark")}
                        classNames={{
                            control: () =>
                                "rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-shadow duration-150 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
                            valueContainer: () => "px-3",
                            singleValue: () => "text-sm",
                            placeholder: () => "text-gray-400",
                            menu: () => "mt-1 rounded-lg border border-gray-200 bg-white shadow-lg z-50 dark:border-gray-700 dark:bg-gray-800",
                            option: (s) => `px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ${s.isFocused ? "bg-slate-50 dark:bg-slate-900/60" : ""}`,
                        }}
                    />
                </label>

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Porte</span>
                    <Select
                        value={ANIMAL_DATA.size.map((s) => ({ value: s.value, label: s.label })).sort((a, b) => a.label.localeCompare(b.label)).find((o) => o.value === form.size) ?? null}
                        onChange={(opt) => updateField("size", (opt as any)?.value ?? "")}
                        options={ANIMAL_DATA.size.map((s) => ({ value: s.value, label: s.label })).sort((a, b) => a.label.localeCompare(b.label))}
                        isDisabled={loading}
                        className="w-full"
                        menuPlacement="auto"
                        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                        styles={createSelectStyles("md", theme === "dark")}
                        classNames={{
                            control: () =>
                                "rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-shadow duration-150 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
                            valueContainer: () => "px-3",
                            singleValue: () => "text-sm",
                            placeholder: () => "text-gray-400",
                            menu: () => "mt-1 rounded-lg border border-gray-200 bg-white shadow-lg z-50 dark:border-gray-700 dark:bg-gray-800",
                            option: (s) => `px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ${s.isFocused ? "bg-slate-50 dark:bg-slate-900/60" : ""}`,
                        }}
                    />
                </label>

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cor</span>
                    <Select
                        value={["", ...ANIMAL_DATA.colors].filter(Boolean).map((c) => ({ value: c, label: c })).sort((a, b) => a.label.localeCompare(b.label)).find((o) => o.value === form.color) ?? null}
                        onChange={(opt) => updateField("color", (opt as any)?.value ?? "")}
                        options={ANIMAL_DATA.colors.map((c) => ({ value: c, label: c })).sort((a, b) => a.label.localeCompare(b.label))}
                        isDisabled={loading}
                        className="w-full"
                        menuPlacement="auto"
                        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                        styles={createSelectStyles("md", theme === "dark")}
                        placeholder="Selecione uma cor"
                        classNames={{
                            control: () =>
                                "rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-shadow duration-150 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
                            valueContainer: () => "px-3",
                            singleValue: () => "text-sm",
                            placeholder: () => "text-gray-400",
                            menu: () => "mt-1 rounded-lg border border-gray-200 bg-white shadow-lg z-50 dark:border-gray-700 dark:bg-gray-800",
                            option: (s) => `px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ${s.isFocused ? "bg-slate-50 dark:bg-slate-900/60" : ""}`,
                        }}
                    />
                    {errors.color ? <p className="text-sm text-red-500 dark:text-red-400">{errors.color}</p> : null}
                </label>

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                    <Select
                        value={ANIMAL_DATA.status.map((s) => ({ value: s.value, label: s.label })).sort((a, b) => a.label.localeCompare(b.label)).find((o) => o.value === form.status) ?? null}
                        onChange={(opt) => updateField("status", (opt as any)?.value ?? "")}
                        options={ANIMAL_DATA.status.map((s) => ({ value: s.value, label: s.label })).sort((a, b) => a.label.localeCompare(b.label))}
                        isDisabled={loading}
                        className="w-full"
                        menuPlacement="auto"
                        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                        styles={createSelectStyles("md", theme === "dark")}
                        classNames={{
                            control: () =>
                                "rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-shadow duration-150 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
                            valueContainer: () => "px-3",
                            singleValue: () => "text-sm",
                            placeholder: () => "text-gray-400",
                            menu: () => "mt-1 rounded-lg border border-gray-200 bg-white shadow-lg z-50 dark:border-gray-700 dark:bg-gray-800",
                            option: (s) => `px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ${s.isFocused ? "bg-slate-50 dark:bg-slate-900/60" : ""}`,
                        }}
                    />
                </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                    <input type="checkbox" checked={form.neutered} onChange={(event) => updateField("neutered", event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" disabled={loading} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Castrado</span>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                    <input type="checkbox" checked={form.vaccinated} onChange={(event) => updateField("vaccinated", event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" disabled={loading} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Vacinado</span>
                </label>
            </div>

            <label className="mt-4 flex flex-col gap-1.5">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Observacoes</span>
                <textarea
                    value={form.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    placeholder="Comportamento, saude, preferencias, restricoes..."
                    rows={4}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-shadow duration-150 placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-orange-400 dark:focus:ring-orange-400/50"
                    disabled={loading}
                />
            </label>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">Campos principais sao obrigatorios para salvar o cadastro.</p>
                <div className="flex gap-3">
                    {onCancel ? (
                        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
                            {cancelLabel}
                        </Button>
                    ) : null}
                    <Button type="submit" isLoading={loading} disabled={loading} variant="primary">
                        {submitLabel}
                    </Button>
                </div>
            </div>
        </form>
    );
}
