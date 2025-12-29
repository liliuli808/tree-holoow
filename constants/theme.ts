// Theme colors matching the original Capacitor app
export const Colors = {
    primary: {
        50: '#E3F2FD',
        100: '#BBDEFB',
        200: '#90CAF9',
        300: '#64B5F6',
        400: '#42A5F5',
        500: '#2196F3',
        600: '#1E88E5',
    },
    accent: {
        50: '#F3E5F5',
        100: '#E1BEE7',
        200: '#CE93D8',
        300: '#BA68C8',
    },
    text: {
        primary: '#1a1a1a',
        secondary: '#6b7280',
        muted: '#9ca3af',
    },
    background: {
        primary: '#FFFFFF',
        secondary: '#F3F4F6',
        card: '#FFFFFF',
    },
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
};

// React Native Paper theme
export const PaperTheme = {
    colors: {
        primary: Colors.primary[500],
        secondary: Colors.accent[300],
        background: Colors.background.primary,
        surface: Colors.background.card,
        error: Colors.error,
        text: Colors.text.primary,
        onSurface: Colors.text.primary,
        disabled: Colors.text.muted,
        placeholder: Colors.text.muted,
        backdrop: 'rgba(0, 0, 0, 0.5)',
        notification: Colors.primary[500],
    },
};

// Spacing scale
export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

// Border radius scale
export const BorderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};
