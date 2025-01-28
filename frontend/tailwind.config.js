/* @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': '0% 50%'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': '100% 50%'
          },
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': '0% 0%'
          },
          '25%': {
            'background-position': '100% 0%'
          },
          '50%': {
            'background-position': '100% 100%'
          },
          '75%': {
            'background-position': '0% 100%'
          },
        },
        'animate-before': {
          '0%, 100%': { 
            transform: 'translateY(0)' 
          },
          '50%': { 
            transform: 'translateY(200px) scale(0.8)' 
          },
        },
        'animate-after': {
          '0%, 100%': { 
            transform: 'translateX(0)' 
          },
          '50%': { 
            transform: 'translateX(-250px) scale(1.2)' 
          },
        }
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'glow-before': 'animate-before 15s ease-in-out infinite',
        'glow-after': 'animate-after 15s ease-in-out infinite',
      },
      colors: {
        'dark-bg': '#0a0f1d',
      },
      backgroundImage: {
        'third-glow': 'conic-gradient(from 90deg at 50% 50%, #ff8b7e 0deg, #e24e6b 160deg, #7ed2da 120deg, #8bdce0 55deg, transparent 360deg)',
        'secondary-glow': 'conic-gradient(from 10deg at 50% 50%, #eb7494 0deg, #ae77b2 55deg, #97b5da 120deg, #0099ca 160deg, transparent 360deg)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};