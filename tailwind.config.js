/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        surface: '#111111',
        surface2: '#1a1a1a',
        border: '#222222',
        text: '#f0ece4',
        muted: '#888888',
        accent: '#c8a96e',
        accent2: '#e8c98e',
        red: '#e85d5d',
        green: '#5db87a',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, #1a0f05 0%, #0a0a0a 100%)',
        'hero-dots':
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Ccircle cx='30' cy='30' r='1' fill='%23c8a96e' fill-opacity='0.05'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      keyframes: {
        shimmer: {
          to: { left: '160%' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};
