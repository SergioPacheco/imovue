/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 500: '#1e56a0', 600: '#1a4d8f', 700: '#15407a', 800: '#0f3060', 900: '#0a2040' },
        success: { 50: '#f0fdf4', 500: '#16a34a', 600: '#15803d' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
