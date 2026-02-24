/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './frontend/src/**/*.{js,jsx,ts,tsx}',
    './frontend/public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#023E8A',
          hover: '#002855',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#00B4D8',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#48CAE4',
        },
        neutral: {
          background: '#F8F9FA',
          surface: '#FFFFFF',
        },
        border: '#E2E8F0',
        input: '#E2E8F0',
        ring: '#00B4D8',
        background: '#F8F9FA',
        foreground: '#0F172A',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A',
        },
        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#64748B',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};