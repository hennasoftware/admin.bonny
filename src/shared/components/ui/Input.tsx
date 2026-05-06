import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import type { LucideIcon } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
    showPasswordToggle?: boolean;
    hint?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon: Icon,
    showPasswordToggle = false,
    hint,
    type = "text",
    id,
    className = "",
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const displayType = showPasswordToggle && type === "password" ? (showPassword ? "text" : "password") : type;

    return (
        <div className="flex flex-col gap-1.5">
            {label ? (
                <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            ) : null}

            <div className="relative">
                {Icon ? <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" /> : null}

                <input
                    id={inputId}
                    type={displayType}
                    className={[
                        "w-full cursor-text rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-[box-shadow,border-color,transform] duration-150 placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/15 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-orange-400 dark:focus:ring-orange-400/15",
                        error ? "border-red-400 focus:border-red-400 focus:ring-red-500/15" : "border-slate-200 dark:border-slate-700",
                        Icon ? "pl-10" : "",
                        showPasswordToggle && type === "password" ? "pr-10" : "",
                        "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 disabled:opacity-70 dark:disabled:bg-slate-800 dark:disabled:text-slate-400",
                        "read-only:cursor-default read-only:bg-slate-50 read-only:text-slate-600 dark:read-only:bg-slate-900 dark:read-only:text-slate-300",
                        className,
                    ].join(" ")}
                    {...props}
                />

                {showPasswordToggle && type === "password" ? (
                    <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                ) : null}
            </div>

            {error ? (
                <p className="flex items-center gap-1 text-sm text-red-500 dark:text-red-400">{error}</p>
            ) : hint ? (
                <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{hint}</p>
            ) : null}
        </div>
    );
};
