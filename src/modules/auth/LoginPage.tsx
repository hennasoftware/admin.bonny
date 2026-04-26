import {useState} from 'react';
import {Helmet} from 'react-helmet-async';
import {motion} from 'framer-motion';
import {Mail, Lock, Heart, Sun, Moon} from 'lucide-react';
import {Button, FormField} from '@/shared/components/ui';
import {useTheme} from '@/styles/themes/ThemeContext';
import {useAuth} from "@/modules/auth/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface FormErrors {
    email?: string;
    password?: string;
    general?: string;
}

export function LoginPage() {
    const {theme, toggleTheme} = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Email inválido';
        }

        if (!password) {
            newErrors.password = 'Senha é obrigatória';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            await login(email, password);

            navigate("/dashboard");
        } catch (error: any) {
            let message = "Erro ao fazer login";

            if (error.code === "auth/user-not-found") {
                message = "Usuário não encontrado";
            }

            if (error.code === "auth/wrong-password") {
                message = "Senha incorreta";
            }

            if (error.code === "auth/invalid-email") {
                message = "Email inválido";
            }

            setErrors({ general: message });
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: {opacity: 0, y: 20},
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
        hidden: {opacity: 0, y: 10},
        visible: {opacity: 1, y: 0},
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

            <div
                className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
                <button
                    onClick={toggleTheme}
                    className="absolute top-6 right-6 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors text-gray-600 dark:text-gray-400"
                    title={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
                >
                    {theme === 'light' ? (
                        <Moon className="h-6 w-6"/>
                    ) : (
                        <Sun className="h-6 w-6"/>
                    )}
                </button>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md"
                >
                    <motion.div
                        variants={itemVariants}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-xl p-8 border border-gray-100 dark:border-gray-700"
                    >
                        <motion.div
                            variants={itemVariants}
                            className="flex items-center justify-center gap-2 mb-8"
                        >
                            <Heart className="h-8 w-8 text-orange-500 dark:text-orange-400"/>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Bonny
                            </h1>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Bem-vindo de volta
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Faça login para acessar o painel administrativo
                            </p>
                        </motion.div>

                        {errors.general && (
                            <motion.div
                                variants={itemVariants}
                                className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 flex items-center gap-2"
                            >
                                <div className="w-2 h-2 rounded-full bg-red-500"/>
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    {errors.general}
                                </p>
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
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
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
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    error={errors.password}
                                    disabled={isLoading}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants} className="flex justify-end">
                                <a
                                    href="#"
                                    className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors font-medium"
                                >
                                    Esqueceu a senha?
                                </a>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={isLoading}
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    {isLoading ? 'Entrando...' : 'Entrar'}
                                </Button>
                            </motion.div>
                        </motion.form>

                        <motion.div
                            variants={itemVariants}
                            className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center"
                        >
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Não tem uma conta?{' '}
                                <a
                                    href="https://github.com/hennasoftware"
                                    className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors font-semibold"
                                    target="_blank"
                                >
                                    Solicite acesso
                                </a>
                            </p>
                        </motion.div>
                    </motion.div>

                    <motion.p
                        variants={itemVariants}
                        className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6"
                    >
                        © 2026 · Bonny - Sistema de Gestão de Adoção
                    </motion.p>
                </motion.div>
            </div>
        </>
    );
}
