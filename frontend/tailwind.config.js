export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff5ec',
          100: '#ffe6cc',
          200: '#ffca99',
          500: '#FC8019',
          600: '#e56f00',
          700: '#c55d00'
        },
        surface: '#F8F8F8'
      },
      fontFamily: {
        sans: ['Manrope', 'Segoe UI', 'sans-serif'],
        display: ['Sora', 'Manrope', 'sans-serif']
      },
      boxShadow: {
        card: '0 12px 34px -20px rgba(15, 23, 42, 0.5)'
      }
    }
  },
  plugins: []
};
