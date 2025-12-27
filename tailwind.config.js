/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4 uses the 'nativewind/preset'
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      /**
       * ===========================================
       * 🎨 DESIGN TOKENS - EDIT THESE FOR NEW APPS
       * ===========================================
       *
       * To customize for a new project, update:
       * 1. colors.primary - Your brand color
       * 2. colors.secondary - Secondary brand color
       * 3. colors.accent - Accent/highlight color
       * 4. borderRadius - Adjust roundness to taste
       * 5. fontFamily - Add custom fonts
       */
      colors: {
        // ===================
        // Brand Colors - CUSTOMIZE THESE
        // ===================
        primary: {
          DEFAULT: '#0a7ea4',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0a7ea4', // DEFAULT
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          DEFAULT: '#6b7280',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280', // DEFAULT
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        accent: {
          DEFAULT: '#8b5cf6',
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#8b5cf6', // DEFAULT
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#5b21b6',
          950: '#2e1065',
        },

        // ===================
        // Semantic Colors
        // ===================
        success: {
          DEFAULT: '#22c55e',
          light: '#86efac',
          dark: '#16a34a',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fcd34d',
          dark: '#d97706',
        },
        danger: {
          DEFAULT: '#ef4444',
          light: '#fca5a5',
          dark: '#dc2626',
        },
        info: {
          DEFAULT: '#3b82f6',
          light: '#93c5fd',
          dark: '#2563eb',
        },

        // ===================
        // Background Colors
        // ===================
        background: {
          DEFAULT: '#ffffff',
          secondary: '#f5f5f5',
          tertiary: '#e5e5e5',
          dark: '#151718',
          'dark-secondary': '#1a1a1a',
          'dark-tertiary': '#2a2a2a',
        },

        // ===================
        // Text Colors
        // ===================
        foreground: {
          DEFAULT: '#11181C',
          muted: '#687076',
          subtle: '#9BA1A6',
          dark: '#ECEDEE',
          'dark-muted': '#9BA1A6',
        },

        // ===================
        // Border Colors
        // ===================
        border: {
          DEFAULT: '#e5e7eb',
          dark: '#374151',
        },
      },

      // ===================
      // Border Radius - CUSTOMIZE THESE
      // ===================
      borderRadius: {
        none: '0',
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
        full: '9999px',
      },

      // ===================
      // Spacing Scale (extends default)
      // ===================
      spacing: {
        4.5: '18px',
        13: '52px',
        15: '60px',
        18: '72px',
        22: '88px',
      },

      // ===================
      // Font Sizes
      // ===================
      fontSize: {
        xxs: ['10px', { lineHeight: '14px' }],
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
        '5xl': ['48px', { lineHeight: '1' }],
      },

      // ===================
      // Box Shadows
      // ===================
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        card: '0 2px 8px 0 rgb(0 0 0 / 0.08)',
        button: '0 2px 4px 0 rgb(0 0 0 / 0.1)',
      },

      // ===================
      // Animation (optional)
      // ===================
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
