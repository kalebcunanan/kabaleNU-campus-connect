/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nu-blue': '#2b2a70', /* National University Blue */
        'nu-gold': '#ffd42a', /* National University Gold */
      }
    },
  },
  plugins: [],
}