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
          // Primary Brand Colors
          leaf: '#678A48',
          'leaf-dark': '#55723B',
          blue: '#38588C',
          'blue-dark': '#2A436C',
          yellow: '#CFB850',
          orange: '#D88B33',
          'orange-dark': '#B87223',
          
          // Secondary Colors
          purple: '#8F6BD4',
          berry: '#A13F44',
          'soft-green': '#9FC87B',
          'soft-pink': '#D97B80',
          'baby-blue': '#B4CEF7',
          lavender: '#B4A0E8',
          'soft-yellow': '#E9DCA0',
          peach: '#F0B76A',

          // Balanced Neutrals for editorial educational warmth
          cream: '#FCFAF6',
          'cream-alt': '#F7F4EC',
          paper: '#FFFFFF',
          dark: '#1E293B',
          'dark-muted': '#4B5563',
          border: '#EBE5D8',
          'border-light': '#F1ECE2',
        }
      },
      fontFamily: {
        display: ['"Baloo 2"', 'cursive', 'sans-serif'],
        body: ['"Nunito"', 'sans-serif'],
        accent: ['"Fredoka"', 'cursive', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(56, 88, 140, 0.08), 0 2px 6px -1px rgba(56, 88, 140, 0.04)',
        'card': '0 8px 30px -4px rgba(56, 88, 140, 0.08), 0 4px 10px -2px rgba(56, 88, 140, 0.03)',
        'hover': '0 14px 36px -6px rgba(56, 88, 140, 0.14), 0 6px 14px -3px rgba(56, 88, 140, 0.06)',
      }
    },
  },
  plugins: [],
}
