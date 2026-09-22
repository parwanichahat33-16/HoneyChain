/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        honey: {
          50: '#fffaf0',
          100: '#fef0d0',
          400: '#f4b93e',
          500: '#e8a317',
          600: '#c78409',
          900: '#5c3d0a',
        },
      },
    },
  },
  plugins: [],
};
