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
        soc: {
          dark: '#0B0F19',
          card: '#111827',
          border: '#1F2937',
          hover: '#1E293B',
          accent: '#06B6D4',
          danger: '#EF4444',
          warning: '#F59E0B',
          success: '#10B981',
          info: '#3B82F6'
        }
      }
    },
  },
  plugins: [],
}
