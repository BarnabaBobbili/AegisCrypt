/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Sensitivity level colors
                'sensitivity': {
                    'public': '#10B981',      // Green
                    'internal': '#3B82F6',    // Blue
                    'confidential': '#F59E0B', // Orange
                    'highly-sensitive': '#EF4444', // Red
                },
                // Risk level colors
                'risk': {
                    'low': '#10B981',
                    'medium': '#F59E0B',
                    'high': '#EF4444',
                },
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [],
}
