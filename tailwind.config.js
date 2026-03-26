export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        serif: ['"Instrument Serif"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        red: { DEFAULT: '#8b1f30', hover: '#6e1826' },
        cream: { DEFAULT: '#e8e0d0', dim: '#d4cab8' },
        'off-white': '#f0ebe0',
      }
    }
  },
  plugins: []
}
