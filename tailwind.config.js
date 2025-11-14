/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6A5CFF',
        secondary: '#00E5FF',
        background: '#0D0F14',
        accent: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6A5CFF, #00E5FF)',
      },
    },
  },
  plugins: [],
}
