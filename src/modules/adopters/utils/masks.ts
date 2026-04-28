import { useState, useCallback } from 'react';

export function useCepApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCepData = useCallback(async (cep: string) => {
        if (!cep || cep.length !== 8) return null;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                setError('CEP não encontrado');
                return null;
            }

            return {
                street: data.logradouro || '',
                neighborhood: data.bairro || '',
                city: data.localidade || '',
                state: data.uf || '',
            };
        } catch (err) {
            setError('Erro ao buscar CEP');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { fetchCepData, loading, error };
}

export function formatPhone(value: string): string {
    if (!value) return '';

    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length === 11) {
        return cleaned
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d{4})$/, '$1-$2');
    } else if (cleaned.length === 10) {
        return cleaned
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d{4})$/, '$1-$2');
    }

    return value;
}

export function formatCpf(value: string): string {
    if (!value) return '';

    const cleaned = value.replace(/\D/g, '');

    return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatCep(value: string): string {
    if (!value) return '';

    const cleaned = value.replace(/\D/g, '');

    return cleaned.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

export function validateCpf(cpf: string): boolean {
    const cleaned = cpf.replace(/\D/g, '');

    if (cleaned.length !== 11) return false;

    if (/^(\d)\1+$/.test(cleaned)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleaned[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cleaned[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleaned[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    return remainder === parseInt(cleaned[10]);


}

export function validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
}

export function validateCep(cep: string): boolean {
    const cleaned = cep.replace(/\D/g, '');
    return cleaned.length === 8;
}
