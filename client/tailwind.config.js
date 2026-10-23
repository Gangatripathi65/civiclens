/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1e2a44',
        slatebg: '#f3f6fa',
        accent: '#0f9f8f'
      }
    }
  },
  plugins: []
};
