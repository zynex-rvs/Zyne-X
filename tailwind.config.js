/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#020205",
          darker: "#06050c",
          purple: "#a855f7",
          cyan: "#06b6d4",
          pink: "#ec4899",
          blue: "#3b82f6",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "sans-serif"],
        heading: ["var(--font-space)", "sans-serif"],
        outfit: ["var(--font-outfit)", "sans-serif"],
        cinzel: ["var(--font-cinzel)", "serif"],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite alternate',
        'float-slow': 'floatSlow 20s infinite linear',
      },
      keyframes: {
        pulseGlow: {
          '0%': { boxShadow: '0 0 5px rgba(168, 85, 247, 0.4)' },
          '100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.7), 0 0 35px rgba(6, 182, 212, 0.5)' },
        },
        floatSlow: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '50%': { transform: 'translate(50px, 30px) rotate(180deg)' },
          '100%': { transform: 'translate(0, 0) rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};
