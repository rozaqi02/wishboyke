/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F9F4',
          100: '#DCF2E5',
          200: '#BCE5CE',
          300: '#8FD2AC',
          400: '#52BB81',
          500: '#009B4C', // Official Wish vibrant botanical green
          600: '#008340',
          700: '#076734',
          800: '#0B532C',
          900: '#0B4525',
          dark: '#08331C',
        },
        wish: {
          50: '#F0F9F4',
          100: '#DCF2E5',
          200: '#BCE5CE',
          300: '#8FD2AC',
          400: '#52BB81',
          500: '#009B4C', // Official Wish signature green
          600: '#008340',
          700: '#076734',
          800: '#0B532C',
          900: '#0B4525',
          soft: '#EAF6EF',
          border: '#CBE7D6',
        },
        gold: {
          50: '#fcfaf6',
          100: '#f8f2e7',
          200: '#f0e3cc',
          300: '#e5cdab',
          400: '#d7b385',
          500: '#c79c65',
          600: '#b0814f',
        },
        sand: {
          50: '#FAF8F5',
          100: '#FBF7EE', // Section 1 & Section 3 background (exact UMA cream)
          200: '#F7F2E7',
          300: '#EFE9DF', // Footer sand tone
          400: '#E2DBD0',
        },
        pastel: {
          sky: '#C8DFE8', // Section 4 soft blue background
          aqua: '#C7E2E8', // Top announcement bar
        },
        uma: {
          dark: '#24211D', // Deep charcoal typography and pill buttons
          subtle: '#6B655F', // Muted text
          border: '#EDE8E1',
        },
        neutral: {
          surface: '#FAF8F5', // Warm organic ivory paper tone (exact UMA Women background)
          border: '#EDE8E1',
        }
      },
      fontFamily: {
        sans: [
          '"DM Sans"',
          '"Afacad"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        afacad: [
          '"Afacad"',
          'sans-serif',
        ],
        serif: [
          '"DM Sans"',
          '"Afacad"',
          '-apple-system',
          'sans-serif',
        ],
        mono: [
          '"DM Sans"',
          'ui-monospace',
          'SFMono-Regular',
          'sans-serif',
        ],
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '14px',
        '2xl': '18px',
        '3xl': '24px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'hover': '0 6px 16px -2px rgba(13, 92, 70, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'soft': '0 4px 20px -2px rgba(13, 92, 70, 0.06)',
        'drawer': '-8px 0 28px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
