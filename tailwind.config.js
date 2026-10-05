/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',     // Vibrant Warm Orange
          600: '#ea580c',     // Deep Orange
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          dark: '#121214',    // Warm Charcoal Obsidian (No Navy/Blue)
          darker: '#0a0a0b',  // Pitch Obsidian
          cardDark: '#1c1b1a',// Warm Dark Surface
          cardDarkElevated: '#242322',
          borderDark: '#2e2c2a',
          light: '#faf7f2',   // Warm Ivory/Cream
          cardLight: '#ffffff',
          borderLight: '#efe8dd',
          accent: '#f97316',  // Warm Orange accent
          accentHover: '#ea580c',
          amber: '#f59e0b',
          coral: '#ff6b4a',
          success: '#10b981', // Emerald Green
          warning: '#f59e0b', // Warm Amber
          danger: '#ef4444',  // Coral Red
          info: '#f97316',    // Warm Orange (replaced blue)
        },
        // Remap indigo across the app to the warm orange/amber palette
        indigo: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Remap slate across the app to warm neutral stone/obsidian (eliminates cold blue-gray & navy)
        slate: {
          50: '#faf7f2',
          100: '#f5efeb',
          200: '#efe8dd',
          300: '#d6cfc4',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#3f3c39',
          800: '#262423',
          900: '#1c1b1a',
          950: '#121214',
        },
        // Remap blue across the app to the warm orange/amber brand palette
        blue: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Remap sky to warm golden amber
        sky: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Remap cyan to warm sunset coral
        cyan: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(234, 88, 12, 0.06)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'brand': '0 10px 25px -3px rgba(249, 115, 22, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
