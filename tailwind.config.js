/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#0D1117',        // Asosiy fon: to'q ko'k-qora
          card: '#161B22',      // Karta foni: biroz ochroq to'q ko'k-kulrang
          cardBorder: '#30363D',// Standart chegara
          accent: '#E8B84B',    // Asosiy urg'u: oltin-bronza
          accentHover: '#D4A437',
          success: '#3F8F6F',   // Tugallangan holat: yashil
          locked: '#4A4F58',    // Qulflangan holat: xira kulrang
          textPrimary: '#F0EAD6',// Asosiy matn: iliq oq
          textMuted: '#8B93A1',  // Ikkinchi darajali matn: o'rta ko'k-kulrang
        }
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'Poppins', 'Manrope', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(232, 184, 75, 0.25)',
        'card-subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
