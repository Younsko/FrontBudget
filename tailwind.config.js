/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#17B169',
          dark: '#023020',
          light: '#1fd77f',
        },
        chalk: '#FFFFFC',
        'chalk-dark': '#121211',
        secondary: '#F5F5F2',
        'secondary-dark': '#1f1f1d',
        'secondary-dark-lighter': '#2a2a27',
        expense: '#E84855',
        'expense-dark': '#ff6b77',
        info: '#4A90E2',
        'info-dark': '#6ba3f5',
        warning: '#F4C430',
        'warning-dark': '#ffd95a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.06)',
        card: '0 4px 16px rgba(0, 0, 0, 0.08)',
        'soft-dark': '0 2px 8px rgba(0, 0, 0, 0.4)',
        'card-dark': '0 4px 16px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
  
};