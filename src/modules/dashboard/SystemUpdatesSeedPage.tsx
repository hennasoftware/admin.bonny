import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/modules/dashboard/AdminLayout";
import { Button, EntityAlert, EntityPageHeader, EntityPageShell, EntitySectionCard, EntityStatsGrid } from "@/shared/components/ui";
import { SYSTEM_UPDATES_SEED } from "./systemUpdatesSeedData";
import { seedSystemUpdatesWithWebSdk } from "./systemUpdatesWriteService";

export function SystemUpdatesSeedPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSeed = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const total = await seedSystemUpdatesWithWebSdk();
            setMessage(`${total} atualizacoes foram gravadas em system_updates.`);
        } catch (seedError) {
            const nextMessage = seedError instanceof Error ? seedError.message : "Nao foi possivel gravar as atualizacoes no Firebase.";
            setError(nextMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Bonny | Publicar atualizacoes</title>
            </Helmet>

            <AdminLayout>
                <EntityPageShell maxWidth="5xl">
                    <EntityPageHeader
                        eyebrow="Sistema"
                        title="Publicar historico de atualizacoes"
                        description="Use esta tela protegida para gravar o conteudo de system_updates diretamente no Firestore com o usuario autenticado no app."
                        action={
                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={() => navigate("/dashboard")}>
                                    Voltar
                                </Button>
                                <Button variant="primary" onClick={handleSeed} isLoading={loading} disabled={loading}>
                                    Gravar no Firebase
                                </Button>
                            </div>
                        }
                    />

                    <EntityStatsGrid
                        items={[
                            { label: "Releases no seed", value: SYSTEM_UPDATES_SEED.length },
                            { label: "Ultima release", value: SYSTEM_UPDATES_SEED.at(-1)?.version ?? "-" },
                            { label: "Colecao alvo", value: "system_updates" },
                            { label: "Modo", value: "SDK web" },
                        ]}
                    />

                    {message ? <EntityAlert>{message}</EntityAlert> : null}
                    {error ? <EntityAlert tone="error">{error}</EntityAlert> : null}

                    <EntitySectionCard className="space-y-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">Conteudo</p>
                            <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-950 dark:text-white">Atualizacoes que serao publicadas</h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                A operacao faz upsert por ID, entao as releases existentes sao atualizadas e as novas sao criadas.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {SYSTEM_UPDATES_SEED.map((update) => (
                                <div
                                    key={update.id}
                                    className="rounded-2xl border border-orange-100/70 bg-orange-50/60 px-4 py-3 dark:border-orange-500/10 dark:bg-orange-500/5"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-600 dark:text-orange-300">
                                                Release {update.version}
                                            </p>
                                            <h3 className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{update.title}</h3>
                                        </div>
                                        <span className="rounded-full border border-current/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
                                            {update.kind}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{update.summary}</p>
                                </div>
                            ))}
                        </div>
                    </EntitySectionCard>
                </EntityPageShell>
            </AdminLayout>
        </>
    );
}
