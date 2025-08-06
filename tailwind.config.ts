import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
      colors: {
        blue: {
          400: '#2589FE',
          500: '#0070F3',
          600: '#2F6FEB',
        },
      },
      animation: {
        'toast-in': 'slideIn 0.5s ease-out forwards',
        'toast-out': 'slideOut 0.5s ease-in forwards',
      },
    },
    keyframes: {
      shimmer: {
        '100%': {
          transform: 'translateX(100%)',
        },
      },
      slideIn: {
        '0%': {
          transform: 'translateX(100%)',
          opacity: '0',
        },
        '100%': {
          transform: 'translateX(0)',
          opacity: '1',
        },
      },
      slideOut: {
        '0%': {
          transform: 'translateX(0)',
          opacity: '1',
        },
        '100%': {
          transform: 'translateX(100%)',
          opacity: '0',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
