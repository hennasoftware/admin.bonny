import { useState, type FormEvent } from "react";
import { FirebaseError } from "firebase/app";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Heart, Lock, Mail, Moon, Sun, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "@/modules/auth/services/userProfiles";
import { Button, FormField } from "@/shared/components/ui";
import { useTheme } from "@/styles/themes/useTheme";

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
}

export function RegisterPage() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const nextErrors: FormErrors = {};

        if (!name.trim()) nextErrors.name = "Nome e obrigatorio";
        if (!email.trim()) nextErrors.email = "Email e obrigatorio";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Email invalido";
        if (!password) nextErrors.password = "Senha e obrigatoria";
        else if (password.length < 6) nextErrors.password = "Use pelo menos 6 caracteres";
        if (!confirmPassword) nextErrors.confirmPassword = "Confirme a senha";
        else if (confirmPassword !== password) nextErrors.confirmPassword = "As senhas nao coincidem";

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            await registerUser({
                name,
                email,
                password,
            });
            navigate("/acesso-pendente", { replace: true });
        } catch (error) {
            let message = "Nao foi possivel concluir o cadastro";
            const errorCode = error instanceof FirebaseError ? error.code : undefined;

            if (errorCode === "auth/email-already-in-use") message = "Ja existe uma conta com esse email";
            if (errorCode === "auth/invalid-email") message = "Email invalido";
            if (errorCode === "auth/weak-password") message = "Senha fraca";

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
                <title>Bonny | Solicitar acesso</title>
            </Helmet>

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.12),transparent_22%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.55),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.6),transparent_22%)]" />

                <button
                    type="button"
                    onClick={toggleTheme}
                    className="absolute right-4 top-4 rounded-2xl border border-white/70 bg-white/80 p-3 text-gray-600 shadow-[0_14px_40px_-28px_rgb(15_23_42/0.35)] backdrop-blur transition-colors hover:text-gray-950 dark:border-slate-700/60 dark:bg-slate-950/70 dark:text-gray-300 dark:hover:text-white"
                >
                    {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </button>

                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative w-full max-w-lg">
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
                                <p className="text-sm text-gray-500 dark:text-gray-400">Solicitacao de acesso</p>
                            </div>
                        </motion.div>

                        {errors.general ? (
                            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                                {errors.general}
                            </div>
                        ) : null}

                        <motion.form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <motion.div variants={itemVariants}>
                                <FormField
                                    label="Nome"
                                    icon={UserRound}
                                    placeholder="Seu nome completo"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    error={errors.name}
                                    disabled={isLoading}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <FormField
                                    type="email"
                                    label="Email"
                                    icon={Mail}
                                    placeholder="seu@email.com"
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
                                    icon={Lock}
                                    placeholder="Crie uma senha"
                                    showPasswordToggle
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    error={errors.password}
                                    disabled={isLoading}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <FormField
                                    type="password"
                                    label="Confirmar senha"
                                    icon={Lock}
                                    placeholder="Repita a senha"
                                    showPasswordToggle
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    error={errors.confirmPassword}
                                    disabled={isLoading}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading} className="w-full">
                                    {isLoading ? "Enviando solicitacao..." : "Solicitar acesso"}
                                </Button>
                            </motion.div>
                        </motion.form>

                        <motion.div variants={itemVariants} className="mt-6 border-t border-slate-200/70 pt-6 text-center dark:border-slate-800">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Ja possui conta?{" "}
                                <Link to="/login" className="font-semibold text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-300 dark:hover:text-orange-200">
                                    Fazer login
                                </Link>
                            </p>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}
