import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext, type Theme } from "./ThemeContextObject";

type ThemePreference = Theme | "system";

const STORAGE_KEY = "theme";

function getSystemTheme(): Theme {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredPreference(): ThemePreference {
    const storedPreference = localStorage.getItem(STORAGE_KEY);
    return storedPreference === "light" || storedPreference === "dark" ? storedPreference : "system";
}

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [preference, setPreference] = useState<ThemePreference>(() => getStoredPreference());
    const [systemTheme, setSystemTheme] = useState<Theme>(() => getSystemTheme());
    const [isChangingTheme, setIsChangingTheme] = useState(false);

    useEffect(() => {
        if (preference !== "system") {
            return;
        }

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = (event: MediaQueryListEvent) => {
            setSystemTheme(event.matches ? "dark" : "light");
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [preference]);

    const theme = preference === "system" ? systemTheme : preference;

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");

        if (preference === "system") {
            localStorage.removeItem(STORAGE_KEY);
        } else {
            localStorage.setItem(STORAGE_KEY, preference);
        }
    }, [preference, theme]);

    const toggleTheme = useCallback(() => {
        setIsChangingTheme(true);
        setPreference(theme === "light" ? "dark" : "light");

        setTimeout(() => {
            setIsChangingTheme(false);
        }, 250);
    }, [theme]);

    const value = useMemo(
        () => ({
            theme,
            toggleTheme,
            isChangingTheme,
        }),
        [isChangingTheme, theme, toggleTheme],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
