/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,jsx,mdx}',
    './src/components/**/*.{js,jsx,mdx}',
    './src/app/**/*.{js,jsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fdf8f3',
          100: '#f5e6d3',
          200: '#ebd4a8',
          300: '#e0b878',
          400: '#d4985a',
          500: '#c77c3a',
          600: '#b8682e',
          700: '#9d5428',
          800: '#7f4620',
          900: '#6b3a18',
        },
      },
    },
  },
  plugins: [],
};