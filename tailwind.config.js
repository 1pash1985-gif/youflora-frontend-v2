/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'ozon-blue': '#005BFF',
        'ozon-blue-600': '#0A53F0',
        'ozon-red': '#FF3B30'
      },
      boxShadow: { header: '0 1px 0 rgba(0,0,0,0.06)' },
      borderRadius: { xl: '14px' }
    },
  },
  plugins: [],
};
