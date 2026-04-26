import {useEffect, useState} from "react";
import {motion} from "framer-motion";
import {Heart} from "lucide-react";
import { Helmet } from "react-helmet-async";

export function ComingSoon() {
    const [timeLeft, setTimeLeft] = useState(getTimeRemaining());

    function getTimeRemaining() {
        const targetDate = new Date("2026-08-01T00:00:00");
        const now = new Date();
        const difference = targetDate.getTime() - now.getTime();

        if (difference <= 0) {
            return {dias: 0, horas: 0, minutos: 0, segundos: 0};
        }

        return {
            dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
            horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutos: Math.floor((difference / 1000 / 60) % 60),
            segundos: Math.floor((difference / 1000) % 60),
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(getTimeRemaining());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <Helmet>
                <title>Bonny | Em breve</title>
                <meta
                    name="description"
                    content="Sistema de gestão de adoção de animais da ONG Bonny. Em breve."
                />
            </Helmet>

            <div
                className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-100 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-200 px-4">
                <motion.div
                    initial={{opacity: 0, y: 30}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.8}}
                    className="text-center max-w-xl w-full"
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Heart className="text-orange-500 dark:text-orange-400"/>
                        <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">Bonny</h1>
                    </div>

                    <h2 className="text-4xl font-bold mb-3">Em breve</h2>

                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Estamos preparando um espaço especial para conectar você a animais
                        que precisam de um lar cheio de amor.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                        {Object.entries(timeLeft).map(([label, value]) => (
                            <div
                                key={label}
                                className="bg-white dark:bg-gray-800 border border-orange-200 dark:border-gray-600 p-4 rounded-2xl shadow-sm"
                            >
                                <p className="text-2xl font-semibold text-orange-600 dark:text-orange-400">{value}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center">
                        <a
                            href="https://github.com/hennasoftware/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 rounded-xl bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700 transition font-semibold text-white"
                        >
                            Entrar em contato ❤️
                        </a>
                    </div>

                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">
                        Adote. Ame. Transforme vidas.
                    </p>
                </motion.div>

                <footer
                    className="fixed bottom-0 left-0 w-full py-3 text-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-t border-orange-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        © 2026 · Henna Software - Todos os direitos reservados
                    </p>
                </footer>

            </div>
        </>
    );
}
