/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        customBackground: "#242424",
        // bar1: "#F955A0",
        // bar2: "#F782B4",
        // bar3: "#F9A6C5",
        // bar4: "#FFC8EE",
        // bar5: "#FBCADD",
        // bar6: "#FCE2EB",
        bar1: "#E56AB3",
        bar2: "#FA87CB",
        bar3: "#EF87BE",
        bar4: "#F9A3CB",
        bar5: "#FCBCD7",
        bar6: "#FFCEE6",
        // bar1: "#ff79b3",
        // bar2: "#ffadd2",
        // bar3: "#ffbbdf",
        // bar4: "#ffc9ec",
        // bar5: "#ffb4d3",
        // bar6: "#ffa4ca",

        bar1Text: "#FFFFFF",
        bar2Text: "#FFFFFF",
        bar3Text: "#FFFFFF",
        bar4Text: "#7F7F7F",
        bar5Text: "#000000",
        bar6Text: "#000000",
        guessbox: "#FFC8EE"
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1)' },
        },
      },
      animation: {
        wave: 'wave 0.5s linear infinite',
      },
    },
  },
  plugins: [],
}

