/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(20, 80%, 50%)',
        accent: 'hsl(220, 80%, 50%)',
        surface: 'hsl(0, 0%, 100%)',
        bg: 'hsl(210, 30%, 95%)',
        text: 'hsl(210, 20%, 20%)',
        border: 'hsl(210, 30%, 85%)',
      },
      borderRadius: {
        'lg': '16px',
        'md': '10px',
        'sm': '6px',
      },
      spacing: {
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
        'xl': '32px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(210, 30%, 10%, 0.1)',
        'overlay': '0 8px 24px hsla(210, 30%, 10%, 0.12)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}