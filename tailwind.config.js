/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './data/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--background)',
        ink: 'var(--text)',
        bronze: 'var(--primary)',
        sage: 'var(--secondary)',
        clay: 'var(--accent)',
        panel: 'var(--panel)',
        line: 'var(--line)',
        glow: 'var(--glow)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
      },
      boxShadow: {
        panel: '0 18px 48px rgba(6, 9, 8, 0.08)',
      },
    },
  },
  plugins: [],
};