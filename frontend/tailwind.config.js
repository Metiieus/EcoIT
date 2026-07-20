/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F4F5F0',
        card: '#FFFFFF',
        textMain: '#0E1B14',
        textMuted: '#9AA3AF',
        brand: '#10B981',
        brandDark: '#0E3B2A',
        brandLight: '#3DF08F',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
