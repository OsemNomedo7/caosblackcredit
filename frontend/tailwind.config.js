/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f8eeff',
          100: '#efd6ff',
          200: '#dba8ff',
          300: '#c070ee',
          400: '#a03ce1',
          500: '#820AD1',
          600: '#6406a5',
          700: '#4b047d',
          800: '#370360',
          900: '#23023c',
          950: '#140124',
        },
        dark: {
          900: '#ffffff',
          800: '#f8f0ff',
          700: '#f0e5ff',
          600: '#e6d0ff',
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #820AD1 0%, #4b047d 50%, #f8f0ff 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(130,10,209,0.1) 0%, rgba(75,4,125,0.04) 100%)',
        'gradient-score-low': 'linear-gradient(90deg, #ef4444, #f97316)',
        'gradient-score-mid': 'linear-gradient(90deg, #f97316, #eab308)',
        'gradient-score-high': 'linear-gradient(90deg, #22c55e, #16a34a)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'count-up': 'countUp 2s ease-out',
        'particle': 'particle 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(130,10,209,0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(130,10,209,0.6), 0 0 80px rgba(130,10,209,0.2)' },
        },
        particle: {
          '0%': { transform: 'translateY(100vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100px) rotate(720deg)', opacity: '0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
