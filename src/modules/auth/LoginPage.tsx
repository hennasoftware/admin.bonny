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

        if (!email.trim()) {
            newErrors.email = "Email é obrigatório";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Email inválido";
        }

        if (!password) {
            newErrors.password = "Senha é obrigatória";
        }

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

            if (errorCode === "auth/user-not-found") {
                message = "Usuário não encontrado";
            }

            if (errorCode === "auth/wrong-password") {
                message = "Senha incorreta";
            }

            if (errorCode === "auth/invalid-email") {
                message = "Email inválido";
            }

            setErrors({ general: message });
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <>
            <Helmet>
                <title>Bonny | Login</title>
                <meta
                    name="description"
                    content="Faça login no sistema de gestão de adoção de animais Bonny"
                />
            </Helmet>

            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 via-white to-orange-50 px-4 py-8 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="absolute top-6 right-6 rounded-lg p-2 text-gray-600 transition-colors hover:bg-white/50 dark:text-gray-400 dark:hover:bg-gray-800/50"
                    title={`Mudar para tema ${theme === "light" ? "escuro" : "claro"}`}
                >
                    {theme === "light" ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
                </button>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md"
                >
                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:shadow-xl"
                    >
                        <motion.div
                            variants={itemVariants}
                            className="mb-8 flex items-center justify-center gap-2"
                        >
                            <Heart className="h-8 w-8 text-orange-500 dark:text-orange-400" />
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bonny</h1>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                                Bem-vindo de volta
                            </h2>
                            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                                Faça login para acessar o painel administrativo
                            </p>
                        </motion.div>

                        {errors.general && (
                            <motion.div
                                variants={itemVariants}
                                className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-900/20"
                            >
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
                            </motion.div>
                        )}

                        <motion.form onSubmit={handleSubmit} className="space-y-4">
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
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Recuperação de senha em breve.
                                </p>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={isLoading}
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    {isLoading ? "Entrando..." : "Entrar"}
                                </Button>
                            </motion.div>
                        </motion.form>

                        <motion.div
                            variants={itemVariants}
                            className="mt-6 border-t border-gray-200 pt-6 text-center dark:border-gray-700"
                        >
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Não tem uma conta?{" "}
                                <a
                                    href="https://github.com/hennasoftware"
                                    className="font-semibold text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Solicite acesso
                                </a>
                            </p>
                        </motion.div>
                    </motion.div>

                    <motion.p
                        variants={itemVariants}
                        className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400"
                    >
                        © 2026 · Bonny - Sistema de Gestão de Adoção
                    </motion.p>
                </motion.div>
            </div>
        </>
    );
}
