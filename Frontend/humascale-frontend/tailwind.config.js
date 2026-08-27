/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Cairo',
          'Tajawal',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        // Brand colors aligned with the PDF design
        brand: {
          50: '#eef4ff',
          100: '#dce8ff',
          200: '#bcd1ff',
          300: '#8eb1ff',
          400: '#5a85ff',
          500: '#365fff',
          600: '#1f3ff5',
          700: '#1730d8',
          800: '#192aae',
          900: '#1a2a89',
          950: '#141b53',
        },
        // Readiness palette (mirrors backend enum colors)
        readiness: {
          low: '#DC2626',
          medium: '#F59E0B',
          good: '#16A34A',
        },
      },
      boxShadow: {
        soft: '0 6px 20px -8px rgba(15, 23, 42, 0.15)',
        card: '0 8px 30px -10px rgba(15, 23, 42, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
