/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Primary: Coral Red - Bold & Energetic
                primary: {
                    50: '#fef3f2',
                    100: '#fee4e2',
                    200: '#fecdca',
                    300: '#fca6a0',
                    400: '#f87168',
                    500: '#E94F37', // Main coral red
                    600: '#d63a24',
                    700: '#b42d1a',
                    800: '#952919',
                    900: '#7c281b',
                    950: '#431109',
                },
                // Accent: Same coral for consistency, can customize
                accent: {
                    50: '#fef3f2',
                    100: '#fee4e2',
                    200: '#fecdca',
                    300: '#fca6a0',
                    400: '#f87168',
                    500: '#E94F37',
                    600: '#d63a24',
                    700: '#b42d1a',
                    800: '#952919',
                    900: '#7c281b',
                    950: '#431109',
                },
                // Charcoal: Dark text and elements
                charcoal: {
                    50: '#f6f7f8',
                    100: '#ebedef',
                    200: '#d3d7db',
                    300: '#adb5bb',
                    400: '#808c94',
                    500: '#657179',
                    600: '#505b63',
                    700: '#434c52',
                    800: '#393E41', // Main charcoal
                    900: '#333739',
                    950: '#1f2223',
                },
                // Cream: Light backgrounds
                cream: {
                    50: '#FDFDF9',
                    100: '#F6F7EB', // Main cream
                    200: '#ECEEE0',
                    300: '#E0E3D1',
                    400: '#D0D4BD',
                    500: '#BEC3A6',
                    600: '#A8AD8C',
                    700: '#8C9172',
                    800: '#727660',
                    900: '#5E6250',
                },
                // Success: Fresh Green
                success: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
                // Warning: Warm Amber
                warning: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                },
                // Danger: Using primary coral for consistency
                danger: {
                    50: '#fef3f2',
                    100: '#fee4e2',
                    200: '#fecdca',
                    300: '#fca6a0',
                    400: '#f87168',
                    500: '#E94F37',
                    600: '#d63a24',
                    700: '#b42d1a',
                    800: '#952919',
                    900: '#7c281b',
                },
                // Override slate with charcoal tones
                slate: {
                    50: '#f6f7f8',
                    100: '#ebedef',
                    200: '#d3d7db',
                    300: '#adb5bb',
                    400: '#808c94',
                    500: '#657179',
                    600: '#505b63',
                    700: '#434c52',
                    800: '#393E41',
                    850: '#2d3134',
                    900: '#1f2223',
                    950: '#141617',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                display: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
            },
            boxShadow: {
                'glow': '0 0 20px rgba(233, 79, 55, 0.3)',
                'glow-lg': '0 0 40px rgba(233, 79, 55, 0.4)',
                'glow-accent': '0 0 20px rgba(233, 79, 55, 0.3)',
                'inner-glow': 'inset 0 0 20px rgba(233, 79, 55, 0.1)',
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
        },
    },
    plugins: [],
}
