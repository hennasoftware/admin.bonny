import type { SystemUpdateEntry } from "./systemUpdates";

export const SYSTEM_UPDATES_SEED: SystemUpdateEntry[] = [
    {
        id: "release-1.0.0",
        version: "1.0.0",
        title: "Base operacional do sistema Bonny",
        summary: "Primeira release com o fluxo principal da ONG para cadastro, acompanhamento e dashboard.",
        publishedAt: "2026-04-28T10:00:00-03:00",
        kind: "feature",
        highlights: [
            "Cadastro e listagem de animais com status e edicao.",
            "Cadastro e acompanhamento de adotantes.",
            "Fluxo de adocoes com dashboard e atualizacao em tempo real.",
        ],
        impactedAreas: ["Animais", "Adotantes", "Adocoes", "Dashboard", "Autenticacao"],
        attentionNote: "Essa release entregou a base do sistema que a ONG usa no dia a dia para operar os registros.",
    },
    {
        id: "release-1.1.0",
        version: "1.1.0",
        title: "Central de atualizacoes no painel",
        summary: "O sistema agora mostra releases dentro do painel para manter a equipe da ONG informada.",
        publishedAt: "2026-05-06T14:00:00-03:00",
        kind: "improvement",
        highlights: [
            "Novo sino de notificacoes com contador de novidades.",
            "Historico de releases carregado direto do Firebase.",
            "Resumo curto do que mudou em cada entrega.",
        ],
        impactedAreas: ["Dashboard", "Comunicacao interna", "Navegacao desktop e mobile"],
        attentionNote: "A equipe pode consultar essa area sempre que houver uma nova entrega ou ajuste importante no sistema.",
    },
    {
        id: "release-1.2.0",
        version: "1.2.0",
        title: "Identificador imutavel para animais",
        summary: "Cada novo animal cadastrado agora recebe um codigo curto e unico gerado automaticamente pelo sistema.",
        publishedAt: "2026-05-12T16:30:00-03:00",
        kind: "feature",
        highlights: [
            "Novo campo animalCode gerado automaticamente no cadastro.",
            "Codigo curto no padrao A0001 exibido em listagens, detalhes e fluxo de adocao.",
            "Busca de animais e adocoes preparada para localizar registros pelo novo identificador.",
        ],
        impactedAreas: ["Animais", "Adocoes", "Operacao diaria", "Rastreabilidade"],
        attentionNote: "O codigo do animal nao pode ser alterado depois do cadastro e passa a ser a referencia recomendada para diferenciar registros com mesmo nome ou raca.",
    },
];
