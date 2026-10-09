/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // The dark and light blues are the outer colors of the auth backdrop gradient.
      colors: {
        'nu-blue': '#2455a6',
        'nu-blue-dark': '#12295a',
        'nu-blue-light': '#4a82d9',
        'nu-gold': '#ffd42a',
        'nu-gold-dark': '#8a6d00',
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      keyframes: {
        'card-exit': { to: { opacity: '0', transform: 'scale(0.95)' } },
        'splash-logo': {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to: { opacity: '1', transform: 'scale(1.1)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'swipe-up': { to: { transform: 'translateY(-100%)' } },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-100%)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'card-exit': 'card-exit 250ms ease-in forwards',
        'splash-logo': 'splash-logo 600ms ease-out both',
        'fade-in': 'fade-in 400ms ease-out 200ms both',
        'swipe-up': 'swipe-up 450ms ease-in-out forwards',
        'slide-down': 'slide-down 300ms ease-out backwards',
        'rise-in': 'rise-in 300ms ease-out backwards',
      },
    },
  },
  plugins: [],
};