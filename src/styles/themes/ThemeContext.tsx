import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isChangingTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('light');
    const [isManual, setIsManual] = useState(false);
    const [isChangingTheme, setIsChangingTheme] = useState(false);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as Theme | null;

        if (storedTheme) {
            setTheme(storedTheme);
            setIsManual(true);
            return;
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setTheme(mediaQuery.matches ? 'dark' : 'light');
    }, []);

    useEffect(() => {
        if (isManual) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            setTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [isManual]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');

        if (isManual) {
            localStorage.setItem('theme', theme);
        }
    }, [theme, isManual]);

    const toggleTheme = async () => {
        setIsManual(true);
        setIsChangingTheme(true);

        const newTheme = theme === 'light' ? 'dark' : 'light';

        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        setTheme(newTheme);

        setTimeout(() => {
            setIsChangingTheme(false);
        }, 250);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isChangingTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
