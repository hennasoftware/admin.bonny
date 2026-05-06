import { useState, type FormEvent } from "react";
import { FirebaseError } from "firebase/app";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Heart, Lock, Mail, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/context/useAuth";
import { Button, FormField } from "@/shared/components/ui";
import { useTheme } from "@/styles/themes/useTheme";

interface FormErrors {
    email?: string;
    password?: string;
    general?: string;
}

export function LoginPage() {
    const { theme, toggleTheme } = useTheme();
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (!email.trim()) newErrors.email = "Email é obrigatório";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Email inválido";

        if (!password) newErrors.password = "Senha é obrigatória";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (error) {
            let message = "Erro ao fazer login";
            const errorCode = error instanceof FirebaseError ? error.code : undefined;

            if (errorCode === "auth/user-not-found") message = "Usuário não encontrado";
            if (errorCode === "auth/wrong-password") message = "Senha incorreta";
            if (errorCode === "auth/invalid-email") message = "Email inválido";

            setErrors({ general: message });
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.08 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <>
            <Helmet>
                <title>Bonny | Login</title>
                <meta name="description" content="Faça login no sistema de gestão de adoção de animais Bonny" />
            </Helmet>

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.12),transparent_22%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.55),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.6),transparent_22%)]" />

                <button
                    type="button"
                    onClick={toggleTheme}
                    className="absolute right-4 top-4 rounded-2xl border border-white/70 bg-white/80 p-3 text-gray-600 shadow-[0_14px_40px_-28px_rgb(15_23_42/0.35)] backdrop-blur transition-colors hover:text-gray-950 dark:border-slate-700/60 dark:bg-slate-950/70 dark:text-gray-300 dark:hover:text-white"
                    title={`Mudar para tema ${theme === "light" ? "escuro" : "claro"}`}
                >
                    {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </button>

                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative w-full max-w-md">
                    <motion.div
                        variants={itemVariants}
                        className="rounded-[28px] border border-white/70 bg-white/82 p-6 shadow-[0_24px_90px_-40px_rgb(15_23_42/0.45)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-950/70 sm:p-8"
                    >
                        <motion.div variants={itemVariants} className="mb-8 flex items-center gap-3">
                            <div className="rounded-2xl border border-orange-200/70 bg-orange-50 p-3 text-orange-500 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300">
                                <Heart className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">Bonny</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Painel administrativo</p>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <h2 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-white">Bem-vindo de volta</h2>
                            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                Faça login para acessar o sistema de gestão de adoção.
                            </p>
                        </motion.div>

                        {errors.general ? (
                            <motion.div
                                variants={itemVariants}
                                className="mt-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
                            >
                                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                <p className="text-sm">{errors.general}</p>
                            </motion.div>
                        ) : null}

                        <motion.form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <motion.div variants={itemVariants}>
                                <FormField
                                    type="email"
                                    label="Email"
                                    placeholder="seu@email.com"
                                    icon={Mail}
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    error={errors.email}
                                    disabled={isLoading}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <FormField
                                    type="password"
                                    label="Senha"
                                    placeholder="Sua senha"
                                    icon={Lock}
                                    showPasswordToggle
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    error={errors.password}
                                    disabled={isLoading}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants} className="flex justify-end">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Recuperação de senha em breve.</p>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading} className="w-full">
                                    {isLoading ? "Entrando..." : "Entrar"}
                                </Button>
                            </motion.div>
                        </motion.form>

                        <motion.div variants={itemVariants} className="mt-6 border-t border-slate-200/70 pt-6 text-center dark:border-slate-800">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Não tem uma conta?{" "}
                                <a
                                    href="https://github.com/hennasoftware"
                                    className="font-semibold text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-300 dark:hover:text-orange-200"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Solicite acesso
                                </a>
                            </p>
                        </motion.div>
                    </motion.div>

                    <motion.p variants={itemVariants} className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                        © 2026 · Bonny - Sistema de Gestão de Adoção
                    </motion.p>
                </motion.div>
            </div>
        </>
    );
}
