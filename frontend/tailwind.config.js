/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        'dm-sans': ['DM Sans', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'inputField': '#F1F4F9',
        'butonLogin': '#4880FF'
      },
      screens: {
        sm: "384px",
        md: "834px",
        lg: "1025px",
        xl: "1280px",
        "2xl": "1536px",
      },
      spacing: {
        '4.5': '18px',
        '76': '29rem',
        '108': '26.75rem',
        '190.75': '47.69rem'
      }
    }
  },
  plugins: [
    
  ]
}