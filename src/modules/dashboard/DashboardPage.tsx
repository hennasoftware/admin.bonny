import { Helmet } from "react-helmet-async";
import { useAuth } from "@/modules/auth/context/AuthContext";
import { Button } from "@/shared/components/ui";
import { useNavigate } from "react-router-dom";

export function DashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <>
            <Helmet>
                <title>Bonny | Dashboard</title>
            </Helmet>

            <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">

                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Dashboard Bonny 🐾
                    </h1>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Login funcionando com Firebase ✔
                    </p>

                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>ID:</strong> {user?.uid}</p>
                    </div>

                    <Button onClick={handleLogout} className="w-full">
                        Sair do sistema
                    </Button>
                </div>
            </main>
        </>
    );
}
