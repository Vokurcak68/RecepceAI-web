/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Brand barvy převzaté z aplikace (viz PREZENTACE-BRIEF.md §6)
        navy: {
          DEFAULT: '#1f2d3d',
          text: '#243240',
          900: '#16212d',
          800: '#1f2d3d',
          700: '#2b3c4f',
        },
        gold: {
          DEFAULT: '#c8a35b',
          light: '#d8b878',
          dark: '#a8863f',
        },
        mist: {
          DEFAULT: '#eef1f4',
          light: '#f6f8fa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1.25rem',
          lg: '2rem',
        },
      },
      boxShadow: {
        card: '0 10px 40px -12px rgba(31, 45, 61, 0.18)',
        'card-hover': '0 20px 50px -12px rgba(31, 45, 61, 0.28)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
