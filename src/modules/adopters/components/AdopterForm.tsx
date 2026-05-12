import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { Button, FormField } from "@/shared/components/ui";
import type { AdopterFormState } from "../types";
import { formatCep, formatCpf, formatPhone, useCepApi, validateCep, validateCpf, validatePhone } from "../utils/masks";

interface AdopterFormProps {
    initialValues?: Partial<AdopterFormState>;
    submitLabel: string;
    loading?: boolean;
    submitError?: string | null;
    onCancel?: () => void;
    cancelLabel?: string;
    onSubmit: (values: AdopterFormState) => void;
    mode?: "create" | "edit";
}

const INITIAL_VALUES: AdopterFormState = {
    name: "",
    email: "",
    phone: "",
    cpf: "",
    address: {
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
    },
    status: "Ativo",
    notes: "",
};

export function AdopterForm({
    initialValues = {},
    submitLabel,
    loading = false,
    submitError,
    onCancel,
    cancelLabel = "Cancelar",
    onSubmit,
    mode = "create",
}: AdopterFormProps) {
    const [values, setValues] = useState<AdopterFormState>({
        ...INITIAL_VALUES,
        ...initialValues,
    });
    const [errors, setErrors] = useState<Partial<Record<keyof AdopterFormState | `address.${keyof AdopterFormState["address"]}`, string>>>({});

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!values.name.trim()) {
            newErrors.name = "Nome e obrigatorio";
        } else if (values.name.trim().length < 2) {
            newErrors.name = "Nome deve ter pelo menos 2 caracteres";
        } else if (values.name.trim().length > 100) {
            newErrors.name = "Nome deve ter no maximo 100 caracteres";
        }

        if (!values.email.trim()) {
            newErrors.email = "Email e obrigatorio";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
            newErrors.email = "Email invalido";
        } else if (values.email.length > 100) {
            newErrors.email = "Email deve ter no maximo 100 caracteres";
        }

        if (!values.phone.trim()) {
            newErrors.phone = "Telefone e obrigatorio";
        } else if (!validatePhone(values.phone)) {
            newErrors.phone = "Telefone deve ter 10 ou 11 digitos";
        }

        if (!values.cpf.trim()) {
            newErrors.cpf = "CPF e obrigatorio";
        } else if (!validateCpf(values.cpf)) {
            newErrors.cpf = "CPF invalido";
        }

        if (!values.address.street.trim()) {
            newErrors["address.street"] = "Rua e obrigatoria";
        } else if (values.address.street.length > 100) {
            newErrors["address.street"] = "Rua deve ter no maximo 100 caracteres";
        }

        if (!values.address.number.trim()) {
            newErrors["address.number"] = "Numero e obrigatorio";
        } else if (values.address.number.length > 10) {
            newErrors["address.number"] = "Numero deve ter no maximo 10 caracteres";
        }

        if (values.address.complement && values.address.complement.length > 50) {
            newErrors["address.complement"] = "Complemento deve ter no maximo 50 caracteres";
        }

        if (!values.address.neighborhood.trim()) {
            newErrors["address.neighborhood"] = "Bairro e obrigatorio";
        } else if (values.address.neighborhood.length > 50) {
            newErrors["address.neighborhood"] = "Bairro deve ter no maximo 50 caracteres";
        }

        if (!values.address.city.trim()) {
            newErrors["address.city"] = "Cidade e obrigatoria";
        } else if (values.address.city.length > 50) {
            newErrors["address.city"] = "Cidade deve ter no maximo 50 caracteres";
        }

        if (!values.address.state.trim()) {
            newErrors["address.state"] = "Estado e obrigatorio";
        }

        if (!values.address.zipCode.trim()) {
            newErrors["address.zipCode"] = "CEP e obrigatorio";
        } else if (!validateCep(values.address.zipCode)) {
            newErrors["address.zipCode"] = "CEP deve ter 8 digitos";
        }

        if (values.notes && values.notes.length > 500) {
            newErrors.notes = "Observacoes devem ter no maximo 500 caracteres";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        onSubmit(values);
    };

    const updateValue = (field: keyof AdopterFormState, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const updateAddress = (field: keyof AdopterFormState["address"], value: string) => {
        setValues((prev) => ({
            ...prev,
            address: { ...prev.address, [field]: value },
        }));
        if (errors[`address.${field}` as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [`address.${field}`]: undefined }));
        }
    };

    const { fetchCepData, loading: cepLoading, error: cepError } = useCepApi();
    const [cepFilled, setCepFilled] = useState(false);
    const [lastValidCep, setLastValidCep] = useState("");

    const hasAddressData = !!(values.address.street && values.address.neighborhood && values.address.city && values.address.state);
    const isAddressLocked = cepFilled || (hasAddressData && !lastValidCep);

    useEffect(() => {
        const loadCepData = async () => {
            const cleanCep = values.address.zipCode.replace(/\D/g, "");

            if (cleanCep.length === 8 && cleanCep !== lastValidCep) {
                setCepFilled(false);

                const data = await fetchCepData(cleanCep);
                if (data) {
                    setValues((prev) => ({
                        ...prev,
                        address: {
                            ...prev.address,
                            street: data.street,
                            neighborhood: data.neighborhood,
                            city: data.city,
                            state: data.state,
                        },
                    }));
                    setCepFilled(true);
                    setLastValidCep(cleanCep);
                } else {
                    setValues((prev) => ({
                        ...prev,
                        address: {
                            ...prev.address,
                            street: "",
                            neighborhood: "",
                            city: "",
                            state: "",
                        },
                    }));
                    setCepFilled(false);
                    setLastValidCep("");
                }
            } else if (cleanCep.length < 8 && lastValidCep) {
                setValues((prev) => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        street: "",
                        neighborhood: "",
                        city: "",
                        state: "",
                    },
                }));
                setCepFilled(false);
                setLastValidCep("");
            }
        };

        const timeoutId = setTimeout(loadCepData, 500);
        return () => clearTimeout(timeoutId);
    }, [values.address.zipCode, fetchCepData, lastValidCep]);

    return (
        <form onSubmit={handleSubmit} className="rounded-[28px] border border-orange-100/70 bg-white/82 p-6 shadow-[0_18px_50px_-34px_rgb(15_23_42/0.28)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-950/60 md:p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">Cadastro</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
                        {mode === "edit" ? `Editar ${values.name || "adotante"}` : "Novo adotante"}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Preencha os dados pessoais e de endereco do adotante.
                    </p>
                </div>

                <div className="hidden rounded-2xl bg-orange-50 p-3 text-orange-500 dark:bg-orange-500/10 dark:text-orange-300 md:flex">
                    <User className="h-6 w-6" />
                </div>
            </div>

            {submitError ? (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/95 px-4 py-3 text-sm text-red-700 shadow-[0_16px_40px_-30px_rgb(220_38_38/0.35)] dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                    {submitError}
                </div>
            ) : null}

            <div className="mb-8">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-gray-700 dark:text-gray-300">Informacoes Pessoais</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Nome completo" placeholder="Digite o nome completo" value={values.name} onChange={(e) => updateValue("name", e.target.value)} error={errors.name} disabled={loading} maxLength={100} />
                    <FormField type="email" label="Email" placeholder="email@exemplo.com" value={values.email} onChange={(e) => updateValue("email", e.target.value)} error={errors.email} disabled={loading} maxLength={100} />
                    <FormField label="Telefone" placeholder="(11) 99999-9999" value={formatPhone(values.phone)} onChange={(e) => updateValue("phone", e.target.value)} error={errors.phone} disabled={loading} maxLength={15} />
                    <FormField label="CPF" placeholder="123.456.789-00" value={formatCpf(values.cpf)} onChange={(e) => updateValue("cpf", e.target.value)} error={errors.cpf} disabled={loading} maxLength={14} />
                </div>
            </div>

            <div className="mb-8">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-gray-700 dark:text-gray-300">Endereco</h3>

                <div className="mb-6">
                    <FormField
                        label="CEP"
                        placeholder="12345-678"
                        value={formatCep(values.address.zipCode)}
                        onChange={(e) => updateAddress("zipCode", e.target.value)}
                        error={errors["address.zipCode"] || cepError || undefined}
                        disabled={loading}
                        maxLength={9}
                    />
                    {cepLoading ? <p className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400">Buscando CEP...</p> : null}
                    {cepFilled && !cepError ? <p className="mt-2 text-xs font-medium text-green-600 dark:text-green-400">CEP encontrado. Campos preenchidos automaticamente.</p> : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <FormField label="Rua" placeholder="Nome da rua" value={values.address.street} onChange={(e) => updateAddress("street", e.target.value)} error={errors["address.street"]} disabled maxLength={100} />
                        {isAddressLocked ? <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Campo preenchido automaticamente via CEP</p> : null}
                    </div>

                    <FormField label="Numero" placeholder="123" value={values.address.number} onChange={(e) => updateAddress("number", e.target.value)} error={errors["address.number"]} disabled={loading} maxLength={10} />
                    <FormField label="Complemento" placeholder="Apto 123, Bloco A" value={values.address.complement} onChange={(e) => updateAddress("complement", e.target.value)} disabled={loading} maxLength={50} />

                    <div className="md:col-span-2">
                        <FormField label="Bairro" placeholder="Nome do bairro" value={values.address.neighborhood} onChange={(e) => updateAddress("neighborhood", e.target.value)} error={errors["address.neighborhood"]} disabled maxLength={50} />
                        {isAddressLocked ? <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Campo preenchido automaticamente via CEP</p> : null}
                    </div>

                    <FormField label="Cidade" placeholder="Nome da cidade" value={values.address.city} onChange={(e) => updateAddress("city", e.target.value)} error={errors["address.city"]} disabled maxLength={50} />
                    <div>
                        <FormField label="Estado" placeholder="UF" value={values.address.state} onChange={(e) => updateAddress("state", e.target.value)} error={errors["address.state"]} disabled maxLength={2} />
                        {isAddressLocked ? <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Campo preenchido automaticamente via CEP</p> : null}
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Observacoes</span>
                    <textarea
                        value={values.notes}
                        onChange={(e) => updateValue("notes", e.target.value)}
                        disabled={loading}
                        rows={3}
                        maxLength={500}
                        className="cursor-text rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 outline-none transition-shadow duration-150 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-orange-400 dark:focus:ring-orange-400/50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-700"
                        placeholder="Informacoes adicionais sobre o adotante..."
                    />
                </label>
            </div>

            <div className="border-t border-slate-200/70 pt-6 dark:border-slate-800">
                <div className="flex justify-end gap-3">
                    {onCancel ? (
                        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
                            {cancelLabel}
                        </Button>
                    ) : null}
                    <Button type="submit" variant="primary" isLoading={loading} disabled={loading}>
                        {submitLabel}
                    </Button>
                </div>
            </div>
        </form>
    );
}
