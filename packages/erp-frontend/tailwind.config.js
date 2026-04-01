/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Habilitar modo oscuro por defecto en el ERP
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          900: '#312e81',
        },
        dark: {
          bg: '#121212',
          surface: '#1e1e1e',
          border: '#333333',
          text: '#f3f4f6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Tipografía moderna requerida
      }
    },
  },
  plugins: [],
}
