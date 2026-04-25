/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Segoe UI Variable Display"', '"Aptos"', '"Segoe UI"', 'sans-serif'],
        mono: ['"Cascadia Code"', '"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#dfefff',
          200: '#c7e2ff',
          300: '#9ccfff',
          400: '#69b1ff',
          500: '#2f8af5',
          600: '#1d6edb',
          700: '#1958b0',
          800: '#194b8f',
          900: '#1a4176',
        },
      },
    },
  },
  plugins: [],
};
