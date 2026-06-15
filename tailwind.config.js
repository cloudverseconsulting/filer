/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: [
    "./popup/**/*.{ts,tsx}",
    "./options/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  plugins: [],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          card: "var(--bg-card)"
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)"
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)"
        },
        border: {
          DEFAULT: "var(--border)"
        },
        success: "var(--success)",
        warning: "var(--warning)"
      }
    }
  }
}
