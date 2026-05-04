export function createSelectStyles(size: "sm" | "md" = "md", isDarkOverride?: boolean) {
    const systemIsDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
    const isDark = typeof isDarkOverride === "boolean" ? isDarkOverride : systemIsDark;


    const bg = isDark ? "#1f2937" : "#ffffff";
    const border = isDark ? "#374151" : "#e5e7eb";
    const color = isDark ? "#e5e7eb" : "#111827";
    const placeholderColor = isDark ? "#9ca3af" : "#9ca3af";
    const focusedBg = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";
    const minHeight = size === "sm" ? 32 : 46;
    const borderRadius = 8;

    const focusRing = "0 0 0 4px rgba(249,115,22,0.12)";

    return {
        control: (base: any, state: any) => ({
            ...base,
            minHeight,
            height: minHeight,
            display: 'flex',
            alignItems: 'center',
            boxSizing: 'border-box',
            boxShadow: state.isFocused ? focusRing : 'none',
            borderColor: state.isFocused ? (isDark ? '#f97316' : '#f97316') : border,
            backgroundColor: bg,
            borderRadius,
            transition: 'box-shadow 150ms, border-color 150ms',
            padding: 0,
            fontSize: '0.875rem',
            lineHeight: '1.25',
        }),
        valueContainer: (base: any) => ({
            ...base,
            padding: '0 16px',
            minHeight,
            display: 'flex',
            alignItems: 'center',
        }),
        indicatorsContainer: (base: any) => ({
            ...base,
            paddingRight: 8,
            height: minHeight,
            display: 'flex',
            alignItems: 'center',
        }),
        dropdownIndicator: (base: any) => ({
            ...base,
            padding: 4,
            color: isDark ? '#cbd5e1' : '#6b7280',
            display: 'flex',
            alignItems: 'center',
        }),
        clearIndicator: (base: any) => ({ ...base, padding: 4, display: 'flex', alignItems: 'center' }),
        menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
        menu: (base: any) => ({ ...base, backgroundColor: bg, color, borderRadius }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isFocused ? focusedBg : bg,
            color,
            padding: '8px 16px',
        }),
        singleValue: (base: any) => ({ ...base, color, fontSize: '0.875rem', lineHeight: '1.25' }),
        placeholder: (base: any) => ({ ...base, color: placeholderColor, fontSize: '0.875rem', lineHeight: '1.25' }),
    };
}

