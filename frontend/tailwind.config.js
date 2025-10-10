/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#fdf4f4',
          100: '#fbe8e8',
          200: '#f6d5d5',
          300: '#efb3b3',
          400: '#e58787',
          500: '#d76060',
          600: '#c13f3f',
          700: '#a02f2f',
          800: '#800000',
          900: '#5a0000',
        },
      },
    },
  },
  plugins: [],
};
