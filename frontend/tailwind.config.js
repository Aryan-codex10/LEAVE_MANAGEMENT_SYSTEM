/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    borderRadius: {
      none: '0px',
      xs: '2px',
      sm: '4px',
      DEFAULT: '6px',
      md: '6px',
      lg: '8px',
      xl: '10px',
      '2xl': '12px',
      '3xl': '16px',
      full: '9999px',
    },
    extend: {
      colors: {
        // App neutral slate colors
        slate: {
          50: '#F8F9FB',  // Secondary surface
          100: '#DFE3E8', // Borders
          200: '#C8CED6', // Stronger borders
          300: '#A4B0BE',
          400: '#7A8491', // Muted text
          500: '#64748B',
          550: '#56616F', // Secondary text
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#17202A', // Primary text
        },
        bgApp: '#F5F6F8', // Application background
        surface: '#FFFFFF', // Primary surface
        // Primary Blue Action Color
        primary: {
          DEFAULT: '#2457D6', // Primary Action Blue
          hover: '#1D4BBD',
          light: '#EEF3FF',
          accent: '#2457D6',
          dark: '#1D4BBD',
        },
        // Semantic status colors
        success: {
          DEFAULT: '#18794E', // Approved Primary
          light: '#EDF7F1',   // Approved Light background
        },
        warning: {
          DEFAULT: '#9A6700', // Pending Primary
          light: '#FFF7E6',   // Pending Light background
        },
        danger: {
          DEFAULT: '#B42318', // Rejected Primary
          light: '#FDF0EF',   // Rejected Light background
        },
        // Backward-compatible key maps
        ink: '#17202A',
        navy: {
          DEFAULT: '#17202A',
          light: '#56616F',
          dark: '#17202A',
        },
        canvas: '#F5F6F8',
        amber: {
          DEFAULT: '#9A6700',
          dark: '#9A6700',
        },
      },
      boxShadow: {
        xs: '0 1px 2px rgba(16, 24, 40, 0.05)',
        sm: '0 1px 2px rgba(16, 24, 40, 0.05)',
        DEFAULT: '0 1px 2px rgba(16, 24, 40, 0.05)',
        md: '0 1px 2px rgba(16, 24, 40, 0.05)',
        lg: '0 1px 2px rgba(16, 24, 40, 0.05)',
        xl: '0 1px 2px rgba(16, 24, 40, 0.05)',
        '2xl': '0 1px 2px rgba(16, 24, 40, 0.05)',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
