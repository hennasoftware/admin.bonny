import { useState, useEffect } from "react";
import { Button, FormField } from "@/shared/components/ui";
import { useCepApi, formatPhone, formatCpf, formatCep, validateCpf, validatePhone, validateCep } from "../utils/masks";
import type { AdopterFormState } from "../types";
import { User } from "lucide-react";

interface AdopterFormProps {
    initialValues?: Partial<AdopterFormState>;
    submitLabel: string;
    loading?: boolean;
    onSubmit: (values: AdopterFormState) => void;
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
    onSubmit,
}: AdopterFormProps) {
    const [values, setValues] = useState<AdopterFormState>({
        ...INITIAL_VALUES,
        ...initialValues,
    });
    const [errors, setErrors] = useState<Partial<Record<keyof AdopterFormState | `address.${keyof AdopterFormState['address']}`, string>>>({});

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!values.name.trim()) {
            newErrors.name = "Nome é obrigatório";
        } else if (values.name.trim().length < 2) {
            newErrors.name = "Nome deve ter pelo menos 2 caracteres";
        } else if (values.name.trim().length > 100) {
            newErrors.name = "Nome deve ter no máximo 100 caracteres";
        }

        if (!values.email.trim()) {
            newErrors.email = "Email é obrigatório";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
            newErrors.email = "Email inválido";
        } else if (values.email.length > 100) {
            newErrors.email = "Email deve ter no máximo 100 caracteres";
        }

        if (!values.phone.trim()) {
            newErrors.phone = "Telefone é obrigatório";
        } else if (!validatePhone(values.phone)) {
            newErrors.phone = "Telefone deve ter 10 ou 11 dígitos";
        }

        if (!values.cpf.trim()) {
            newErrors.cpf = "CPF é obrigatório";
        } else if (!validateCpf(values.cpf)) {
            newErrors.cpf = "CPF inválido";
        }

        if (!values.address.street.trim()) {
            newErrors["address.street"] = "Rua é obrigatória";
        } else if (values.address.street.length > 100) {
            newErrors["address.street"] = "Rua deve ter no máximo 100 caracteres";
        }

        if (!values.address.number.trim()) {
            newErrors["address.number"] = "Número é obrigatório";
        } else if (values.address.number.length > 10) {
            newErrors["address.number"] = "Número deve ter no máximo 10 caracteres";
        }

        if (values.address.complement && values.address.complement.length > 50) {
            newErrors["address.complement"] = "Complemento deve ter no máximo 50 caracteres";
        }

        if (!values.address.neighborhood.trim()) {
            newErrors["address.neighborhood"] = "Bairro é obrigatório";
        } else if (values.address.neighborhood.length > 50) {
            newErrors["address.neighborhood"] = "Bairro deve ter no máximo 50 caracteres";
        }

        if (!values.address.city.trim()) {
            newErrors["address.city"] = "Cidade é obrigatória";
        } else if (values.address.city.length > 50) {
            newErrors["address.city"] = "Cidade deve ter no máximo 50 caracteres";
        }

        if (!values.address.state.trim()) {
            newErrors["address.state"] = "Estado é obrigatório";
        }

        if (!values.address.zipCode.trim()) {
            newErrors["address.zipCode"] = "CEP é obrigatório";
        } else if (!validateCep(values.address.zipCode)) {
            newErrors["address.zipCode"] = "CEP deve ter 8 dígitos";
        }

        if (values.notes && values.notes.length > 500) {
            newErrors.notes = "Observações devem ter no máximo 500 caracteres";
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

    const updateAddress = (field: keyof AdopterFormState['address'], value: string) => {
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
    const [lastValidCep, setLastValidCep] = useState('');

    const hasAddressData = !!(values.address.street && values.address.neighborhood && values.address.city && values.address.state);
    const isAddressLocked = cepFilled || (hasAddressData && !lastValidCep);

    useEffect(() => {
        const loadCepData = async () => {
            const cleanCep = values.address.zipCode.replace(/\D/g, '');

            if (cleanCep.length === 8 && cleanCep !== lastValidCep) {
                setCepFilled(false); // Reseta o estado enquanto busca

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
                            street: '',
                            neighborhood: '',
                            city: '',
                            state: '',
                        },
                    }));
                    setCepFilled(false);
                    setLastValidCep('');
                }
            } else if (cleanCep.length < 8 && lastValidCep) {
                setValues((prev) => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        street: '',
                        neighborhood: '',
                        city: '',
                        state: '',
                    },
                }));
                setCepFilled(false);
                setLastValidCep('');
            }
        };

        const timeoutId = setTimeout(loadCepData, 500);
        return () => clearTimeout(timeoutId);
    }, [values.address.zipCode, fetchCepData, lastValidCep]);

    return (
        <form onSubmit={handleSubmit} className="rounded-4xl border border-orange-100 bg-white/92 p-6 shadow-sm dark:border-orange-500/10 dark:bg-slate-900/88 md:p-8">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
                        Cadastro
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
                        {values.name ? `Editar ${values.name}` : "Novo adotante"}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Preencha os dados pessoais e de endereço do adotante.
                    </p>
                </div>

                <div className="hidden rounded-2xl bg-orange-50 p-3 text-orange-500 dark:bg-orange-500/10 dark:text-orange-300 md:flex">
                    <User className="h-6 w-6" />
                </div>
            </div>

            {/* Informações Pessoais */}
            <div className="mb-8">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-gray-700 dark:text-gray-300">
                    Informações Pessoais
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        label="Nome completo"
                        placeholder="Digite o nome completo"
                        value={values.name}
                        onChange={(e) => updateValue("name", e.target.value)}
                        error={errors.name}
                        disabled={loading}
                        maxLength={100}
                    />

                    <FormField
                        type="email"
                        label="Email"
                        placeholder="email@exemplo.com"
                        value={values.email}
                        onChange={(e) => updateValue("email", e.target.value)}
                        error={errors.email}
                        disabled={loading}
                        maxLength={100}
                    />

                    <FormField
                        label="Telefone"
                        placeholder="(11) 99999-9999"
                        value={formatPhone(values.phone)}
                        onChange={(e) => updateValue("phone", e.target.value)}
                        error={errors.phone}
                        disabled={loading}
                        maxLength={15}
                    />

                    <FormField
                        label="CPF"
                        placeholder="123.456.789-00"
                        value={formatCpf(values.cpf)}
                        onChange={(e) => updateValue("cpf", e.target.value)}
                        error={errors.cpf}
                        disabled={loading}
                        maxLength={14}
                    />
                </div>
            </div>

            {/* Endereço */}
            <div className="mb-8">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-gray-700 dark:text-gray-300">
                    Endereço
                </h3>

                {/* CEP - Full Width */}
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
                    {cepLoading && (
                        <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                            🔄 Buscando CEP...
                        </p>
                    )}
                    {cepFilled && !cepError && (
                        <p className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
                            ✓ CEP encontrado! Campos preenchidos automaticamente.
                        </p>
                    )}
                </div>

                {/* Address Fields Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <FormField
                            label="Rua"
                            placeholder="Nome da rua"
                            value={values.address.street}
                            onChange={(e) => updateAddress("street", e.target.value)}
                            error={errors["address.street"]}
                            disabled={true}
                            maxLength={100}
                        />
                        {isAddressLocked && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Campo preenchido automaticamente via CEP
                            </p>
                        )}
                    </div>

                    <FormField
                        label="Número"
                        placeholder="123"
                        value={values.address.number}
                        onChange={(e) => updateAddress("number", e.target.value)}
                        error={errors["address.number"]}
                        disabled={loading}
                        maxLength={10}
                    />

                    <FormField
                        label="Complemento"
                        placeholder="Apto 123, Bloco A"
                        value={values.address.complement}
                        onChange={(e) => updateAddress("complement", e.target.value)}
                        disabled={loading}
                        maxLength={50}
                    />

                    <div className="md:col-span-2">
                        <FormField
                            label="Bairro"
                            placeholder="Nome do bairro"
                            value={values.address.neighborhood}
                            onChange={(e) => updateAddress("neighborhood", e.target.value)}
                            error={errors["address.neighborhood"]}
                            disabled={true}
                            maxLength={50}
                        />
                        {isAddressLocked && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Campo preenchido automaticamente via CEP
                            </p>
                        )}
                    </div>

                    <FormField
                        label="Cidade"
                        placeholder="Nome da cidade"
                        value={values.address.city}
                        onChange={(e) => updateAddress("city", e.target.value)}
                        error={errors["address.city"]}
                        disabled={true}
                        maxLength={50}
                    />

                    <div>
                        <FormField
                            label="Estado"
                            placeholder="UF"
                            value={values.address.state}
                            onChange={(e) => updateAddress("state", e.target.value)}
                            error={errors["address.state"]}
                            disabled={true}
                            maxLength={2}
                        />
                        {isAddressLocked && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Campo preenchido automaticamente via CEP
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Observações */}
            <div className="mb-8">
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Observações</span>
                    <textarea
                        value={values.notes}
                        onChange={(e) => updateValue("notes", e.target.value)}
                        disabled={loading}
                        rows={3}
                        maxLength={500}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 outline-none transition-shadow duration-150 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-orange-400 dark:focus:ring-orange-400/50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-700"
                        placeholder="Informações adicionais sobre o adotante..."
                    />
                </label>
            </div>

            {/* Actions */}
            <div className="border-t border-orange-100 pt-6 dark:border-orange-500/10">
                <div className="flex justify-end">
                    <Button type="submit" variant="primary" isLoading={loading} disabled={loading}>
                        {submitLabel}
                    </Button>
                </div>
            </div>
        </form>
    );
}
