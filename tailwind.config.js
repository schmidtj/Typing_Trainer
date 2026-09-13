/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cozy: {
          bg: "#fdfbf7",
          surface: "#ffffff",
          panel: "#f7f3ea",
          border: "#e6decb",
          text: "#3c3836",
          subtext: "#7c7268",
          meadow: "#78a75a",
          meadowLight: "#e5f2dc",
          sky: "#6ca0dc",
          skyLight: "#e1eefc",
          berry: "#d96b8a",
          berryLight: "#fcebf0",
          sun: "#f4a259",
          sunLight: "#fef3e7",
          wood: "#8d6e63",
          woodLight: "#efebe9",
          lavender: "#a288e3",
          lavenderLight: "#f1edfc",
        },
        finger: {
          leftPinky: "#fca5a5",   // soft red
          leftRing: "#fdba74",    // soft orange
          leftMiddle: "#fde047",  // soft yellow
          leftIndex: "#86efac",   // soft green
          rightIndex: "#6ee7b7",  // soft emerald/teal
          rightMiddle: "#93c5fd", // soft blue
          rightRing: "#c4b5fd",   // soft indigo/purple
          rightPinky: "#f472b6",  // soft pink
          thumbs: "#e2e8f0",      // soft slate
        }
      },
      fontFamily: {
        cozy: ['"Quicksand"', '"Nunito"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      keyframes: {
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(-2px)' },
          '50%': { transform: 'translateY(2px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.05)' },
        }
      },
      animation: {
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 1.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
