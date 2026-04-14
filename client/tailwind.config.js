/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EBF5FB',
          100: '#D6EAF8',
          200: '#AED6F1',
          500: '#1976D2',
          600: '#1565C0',
          700: '#0D47A1',
          900: '#0D1B2A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
