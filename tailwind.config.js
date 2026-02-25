/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D97706',
          dark: '#B45309',
          light: '#F59E0B',
        },
        bg: {
          cream: '#FAF8F5',
          white: '#FFFFFF',
          dark: '#1C1917',
          darker: '#291D15',
        },
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          light: '#9CA3AF',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}