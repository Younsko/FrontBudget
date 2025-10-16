/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#17B169',
          dark: '#023020',
        },
        chalk: '#FFFFFC',
        secondary: '#F5F5F2',
        expense: '#E84855',
        info: '#4A90E2',
        warning: '#F4C430',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.06)',
        card: '0 4px 16px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
