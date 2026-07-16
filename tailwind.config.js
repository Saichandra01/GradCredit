/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Legacy aliases — mapped to light grayscale for landing page.
        // Portal uses pw/sg/si/ob tokens + .portal-theme overrides.
        frost: '#222222',
        glacier: 'rgba(0,0,0,0.08)',
        steely: '#555555',
        obsidian: '#222222',
        // Landing page tokens (light gray/white theme)
        ink: {
          base: '#D1D1D1',   // Hero/Footer background — light gray
          card: '#FFFFFF',   // Cards — white
          surface: '#FAFAFA', // Content sections — frosted white
          light: '#555555',  // Gray description text
        },
        edge: 'rgba(0,0,0,0.08)', // Light borders
        brand: {
          primary: '#222222',   // Dark — primary buttons, accents
          secondary: '#A2A2A2',  // Steely ice — secondary accent
          success: '#16A34A',
          blue: '#3B82F6',
          amber: '#F4B400',
          purple: '#8B5CF6',
        },
        // Portal grayscale palette (authenticated pages)
        pw: '#FAFAFA',       // Frosted White — main bg
        sg: '#D1D1D1',       // Glacier Gray — secondary bg / borders
        si: '#A2A2A2',       // Steely Ice — muted text / icons
        ob: '#222222',       // Obsidian — dark text / sidebar / primary btn
        sb: '#2C2B30',       // not used in portal; kept for compat
        primary: {
          50: '#F5F5F5', 100: '#E8E8E8', 200: '#D1D1D1', 300: '#A2A2A2',
          400: '#666666', 500: '#444444', 600: '#333333', 700: '#222222',
          800: '#1A1A1A', 900: '#111111',
        },
        success: {
          50: '#F0FDF4', 100: '#DCFCE7', 500: '#22C55E', 600: '#16A34A', 700: '#15803D',
        },
        warning: { 50: '#FFFBEB', 100: '#FEF3C7', 500: '#F59E0B', 600: '#D97706' },
        error: { 50: '#FEF2F2', 100: '#FEE2E2', 500: '#EF4444', 600: '#DC2626' },
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
        'rotate-text': 'rotateText 8s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(24px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        pulseSlow: { '0%, 100%': { opacity: '0.08' }, '50%': { opacity: '0.15' } },
        rotateText: {
          '0%, 15%': { opacity: '1', transform: 'translateY(0)' },
          '20%, 85%': { opacity: '0', transform: 'translateY(-20px)' },
          '90%, 100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34, 34, 34, 0.08)' },
          '50%': { boxShadow: '0 0 40px rgba(34, 34, 34, 0.15)' },
        },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.06)',
        card: '0 2px 8px 0 rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 24px 0 rgba(0, 0, 0, 0.1)',
        premium: '0 20px 60px -10px rgba(0, 0, 0, 0.12)',
        glow: '0 0 20px rgba(34, 34, 34, 0.1)',
      },
    },
  },
  plugins: [],
};
