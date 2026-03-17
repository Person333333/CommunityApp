/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/react-app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // We might rely on class or default media queries for dark mode. Enforcing class makes it easier to test.
  theme: {
    extend: {
      colors: {
        deep: '#050505',      // A near-black void
        core: '#FAFAFA',      // Crisp White
        muted: '#A1A1AA',     // Zinc-400
      },
      backgroundImage: {
        'chromic-gradient': 'linear-gradient(135deg, #60A5FA 0%, #C084FC 50%, #F472B6 100%)',
      },
      fontFamily: {
        display: ['"Clash Display"', '"Outfit"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'chromic': '0 4px 30px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 20px rgba(192, 132, 252, 0.15)',
        'chromic-hover': '0 10px 40px rgba(0, 0, 0, 0.7), inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 30px rgba(192, 132, 252, 0.3)',
      },
      borderRadius: {
        'chromic-card': '1.5rem',
        'chromic-pill': '9999px',
      }
    },
  },
  plugins: [],
};
