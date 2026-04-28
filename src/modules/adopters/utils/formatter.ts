export function formatDateTime(date?: string | null | any) {
    if (!date) return "-";

    if (date && typeof date === 'object' && date.toDate) {
        return new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
        }).format(date.toDate());
    }

    try {
        return new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
        }).format(new Date(date));
    } catch {
        return "-";
    }
}

export function formatCPF(cpf: string): string {
    if (!cpf) return "";

    const cleaned = cpf.replace(/\D/g, "");

    return cleaned
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function formatPhone(phone: string): string {
    if (!phone) return "";

    const cleaned = phone.replace(/\D/g, "");

    if (cleaned.length === 11) {
        return cleaned
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{5})(\d{4})$/, "$1-$2");
    } else if (cleaned.length === 10) {
        return cleaned
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d{4})$/, "$1-$2");
    }

    return phone;
}

export function formatAddress(adopter: { address: any }): string {
    const addr = adopter.address;
    if (!addr) return "";

    const parts = [
        addr.street,
        addr.number,
        addr.complement && `(${addr.complement})`,
        addr.neighborhood,
        addr.city,
        addr.state,
        addr.zipCode,
    ].filter(Boolean);

    return parts.join(", ");
}
