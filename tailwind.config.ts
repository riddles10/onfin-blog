import type { Config } from 'tailwindcss'

// Tokens mirror the OnFin parent site (`onfin.io/src/styles/global.css`).
// Both surfaces share the same brand palette and type scale so the cross-
// domain experience is consistent.
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#000000',
          lime: '#9fce10',
          coral: '#fa876b',
          blue: '#2015ff',
        },
        ink: {
          50: '#f7f7f7',
          100: '#eeeeee',
          200: '#cccccc',
          300: '#999999',
          400: '#666666',
          500: '#444444',
          600: '#222222',
          700: '#111111',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'Arial', 'sans-serif'],
        display: ['Unbounded', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        pill: '100px',
      },
      maxWidth: {
        site: '1200px',
      },
    },
  },
  plugins: [],
}

export default config
