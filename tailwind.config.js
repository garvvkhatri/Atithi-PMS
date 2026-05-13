/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        premium: "0 18px 60px rgba(15, 23, 42, 0.10)",
        glow: "0 16px 50px rgba(20, 184, 166, 0.22)"
      }
    }
  },
  plugins: []
};
