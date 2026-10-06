import type { Config } from 'tailwindcss';

const config: Config = {
  // dark: variants follow the .dark class the ThemeProvider sets, not the OS.
  // With the theme pinned to light, an OS in dark mode would otherwise turn on
  // dark text styles (prose, the GitHub graph) over the paper background.
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        // The narrowest phones still in use are 320-360px wide. `xs` is the
        // width at which a label can sit next to an icon without wrapping;
        // below it, controls fall back to the icon alone.
        xs: '380px',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        border: 'var(--border)',
        ring: 'var(--ring)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        // The ID badge palette: paper, ink, and the USC cardinal and gold.
        paper: { DEFAULT: '#F3F0E8', deep: '#E9E4D8' },
        ink: { DEFAULT: '#101012', soft: '#1A1A1D' },
        taupe: '#5E5950',
        line: '#D8D1C2',
        cardinal: { DEFAULT: '#C8102E', deep: '#990000' },
        gold: '#FFCC00',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
        heading: ['var(--font-bricolage)', 'system-ui', 'sans-serif'],
        display: ['var(--font-bricolage)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-instrument)', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.5s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'spotlight': 'spotlight 2s ease .75s 1 forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'foil': 'foil 6s linear infinite',
        'sway': 'sway 6s ease-in-out infinite',
        'swing': 'swing 4.5s ease-in-out infinite',
        'scan': 'scan 2.6s ease-in-out infinite',
        'blink': 'blink 1.4s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'spotlight': {
          '0%': { opacity: '0', transform: 'translate(-72%, -62%) scale(0.5)' },
          '100%': { opacity: '1', transform: 'translate(-50%,-40%) scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Holographic strip on the ID badge.
        'foil': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        // A badge hanging from a lanyard, pivoting above itself.
        'sway': {
          '0%, 100%': { transform: 'rotate(-1.2deg)' },
          '50%': { transform: 'rotate(1.2deg)' },
        },
        'swing': {
          '0%, 100%': { transform: 'rotate(3deg)' },
          '50%': { transform: 'rotate(-2deg)' },
        },
        'scan': {
          '0%, 100%': { top: '0' },
          '50%': { top: 'calc(100% - 3px)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'dot-pattern': 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
        // Pair with bg-[length:200%_100%] and animate-foil so the colors drift.
        'foil': 'linear-gradient(110deg, #f7d6ff, #c9f0ff, #d8ffd6, #fff2c2, #ffd3dd, #f7d6ff)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;

