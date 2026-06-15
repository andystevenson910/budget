/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1A1A2E',
        accent: '#E94560',
        subheader: '#2D4A8A',
        section: '#16213E',
        'alt-row': '#F0F4FF',
        'success-green': '#27AE60',
        'warning-red': '#E74C3C',
        'warning-yellow': '#F39C12',
        'green-bg': '#D6FFE5',
        'red-bg': '#FFD6D6',
      },
    },
  },
  plugins: [],
}

