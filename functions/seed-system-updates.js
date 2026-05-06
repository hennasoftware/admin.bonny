/**
 * Seed script for system_updates.
 *
 * Usage:
 * 1) With Firestore emulator:
 *    $env:FIRESTORE_EMULATOR_HOST = "localhost:8080"; node .\functions\seed-system-updates.js
 * 2) Against the real project:
 *    ensure admin credentials are available, then run:
 *    node .\functions\seed-system-updates.js
 */

const admin = require("firebase-admin");

admin.initializeApp({
    projectId: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "projetobonny-cf64e",
});
const db = admin.firestore();

const updates = [
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
        impactedAreas: [
            "Animais",
            "Adotantes",
            "Adocoes",
            "Dashboard",
            "Autenticacao",
        ],
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
        impactedAreas: [
            "Dashboard",
            "Comunicacao interna",
            "Navegacao desktop e mobile",
        ],
        attentionNote: "A equipe pode consultar essa area sempre que houver uma nova entrega ou ajuste importante no sistema.",
    },
];

async function seedSystemUpdates() {
    for (const update of updates) {
        const { id, ...payload } = update;
        await db.collection("system_updates").doc(id).set(
            {
                ...payload,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
        );

        console.log(`Seeded system_updates/${id}`);
    }

    console.log("System updates seed complete.");
}

seedSystemUpdates()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
