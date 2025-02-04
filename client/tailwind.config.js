/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        customBackground: "#242424",
        bar1: "#F955A0",
        bar2: "#F782B4",
        bar3: "#F9A6C5",
        bar4: "#FFC8EE",
        bar5: "#FBCADD",
        bar6: "#FCE2EB",
        guessbox: "#FFC8EE"
      }
    },
  },
  plugins: [],
}

