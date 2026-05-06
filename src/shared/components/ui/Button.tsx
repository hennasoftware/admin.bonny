import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger";
    isLoading?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    isLoading = false,
    disabled,
    className = "",
    children,
    ...props
}) => {
    const baseStyles =
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

    const variantStyles = {
        primary:
            "border border-orange-500/10 bg-orange-500 text-white shadow-[0_10px_24px_-16px_rgb(249_115_22/0.7)] hover:bg-orange-600 dark:border-orange-400/10 dark:bg-orange-500 dark:hover:bg-orange-400",
        secondary:
            "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-orange-200 hover:bg-orange-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-orange-500/20 dark:hover:bg-slate-800 dark:hover:text-white",
        danger:
            "border border-red-500/10 bg-red-600 text-white shadow-[0_10px_24px_-16px_rgb(220_38_38/0.65)] hover:bg-red-700 dark:border-red-400/10 dark:bg-red-600 dark:hover:bg-red-500",
    };

    const isDisabled = disabled || isLoading;

    return (
        <button disabled={isDisabled} className={`${baseStyles} ${variantStyles[variant]} ${isDisabled ? "cursor-not-allowed" : ""} ${className}`.trim()} {...props}>
            {isLoading ? (
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            ) : null}
            <span>{children}</span>
        </button>
    );
};
