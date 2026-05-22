import { Helmet } from "react-helmet-async";
import { Clock3, LogOut, ShieldAlert, ShieldCheck } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/context/useAuth";
import { Button } from "@/shared/components/ui";

export function PendingApprovalPage() {
    const { user, profile, logout, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (profile?.status === "approved") {
        return <Navigate to="/dashboard" replace />;
    }

    const isRejected = profile?.status === "rejected";
    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <>
            <Helmet>
                <title>Bonny | Acesso pendente</title>
            </Helmet>

            <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.15),transparent_28%),linear-gradient(180deg,#fff7ed_0%,#fff 42%,#fff 100%)] px-3 py-6 sm:px-4 sm:py-10 dark:bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.12),transparent_28%),linear-gradient(180deg,#0f172a_0%,#020617_100%)]">
                <section className="w-full max-w-xl rounded-[28px] border border-white/70 bg-white/88 p-5 shadow-[0_28px_90px_-44px_rgb(15_23_42/0.45)] dark:border-slate-700/60 dark:bg-slate-950/72 sm:rounded-[32px] sm:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className={`w-fit rounded-3xl p-3 ${isRejected ? "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300" : "bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-300"}`}>
                            {isRejected ? <ShieldAlert className="h-6 w-6 sm:h-7 sm:w-7" /> : <Clock3 className="h-6 w-6 sm:h-7 sm:w-7" />}
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">Controle de acesso</p>
                            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
                                {isRejected ? "Solicitacao recusada" : "Aguardando aprovacao"}
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                {isRejected
                                    ? "Seu cadastro foi analisado e nao foi liberado para uso do sistema. Se necessario, fale com um administrador da ONG."
                                    : "Sua conta foi criada com sucesso, mas o acesso so sera liberado apos a aprovacao de um administrador, que tambem definira seu cargo."}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-[24px] border border-orange-100/70 bg-orange-50/70 p-4 dark:border-orange-500/10 dark:bg-orange-500/5 sm:mt-8 sm:rounded-[28px] sm:p-5">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-orange-500 dark:text-orange-300" />
                            <div>
                                <p className="break-words font-semibold text-gray-950 dark:text-white">{profile?.name ?? user.email}</p>
                                <p className="break-all text-sm text-gray-500 dark:text-gray-400">{profile?.email ?? user.email}</p>
                            </div>
                        </div>

                        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                            Status atual: <span className="font-semibold text-gray-950 dark:text-white">{isRejected ? "Rejeitado" : "Pendente de aprovacao"}</span>
                        </p>
                    </div>

                    <div className="mt-6 flex sm:mt-8 sm:justify-end">
                        <Button type="button" variant="secondary" onClick={() => void handleLogout()} className="w-full sm:w-auto">
                            <span className="inline-flex items-center gap-2">
                                <LogOut className="h-4 w-4" />
                                <span>Sair</span>
                            </span>
                        </Button>
                    </div>
                </section>
            </main>
        </>
    );
}
