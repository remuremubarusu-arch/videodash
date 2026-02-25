/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: "hsl(var(--card))",
                "card-foreground": "hsl(var(--card-foreground))",
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                primary: "hsl(var(--primary))",
                "primary-foreground": "hsl(var(--primary-foreground))",
            },
            boxShadow: {
                'sm': '0 2px 8px -1px rgb(0 0 0 / 0.05)',
                'md': '0 8px 16px -2px rgb(0 0 0 / 0.05)',
                'lg': '0 12px 24px -4px rgb(0 0 0 / 0.08)',
                'xl': '0 20px 32px -4px rgb(0 0 0 / 0.1)',
                'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.02)',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.25rem',
                '3xl': '1.75rem',
            }
        },
    },
    plugins: [require("tailwindcss-animate")],
}
