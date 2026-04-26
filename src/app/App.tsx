import { ThemeProvider } from "@/styles/themes/ThemeContext";
import { RouterProvider } from "@/router";
import { AuthProvider } from "@/modules/auth/context/AuthContext";

export default function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <RouterProvider />
            </ThemeProvider>
        </AuthProvider>
    );
}
