/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14213D',
        inkLight: '#1E2E52',
        paper: '#FBF8F3',
        paperDim: '#F2EDE3',
        saffron: '#F2A93B',
        marigold: '#E8871E',
        teal: '#2D8C86',
        charcoal: '#1F2430',
        muted: '#6B7280',
      },
      fontFamily: {
        display: ['"Newsreader"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};
