/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#8B5CF6", // Violet 500
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#10B981", // Emerald 500
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F43F5E", // Rose 500
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#1F2937", // Gray 800
          foreground: "#9CA3AF", // Gray 400
        },
        card: {
          DEFAULT: "rgba(31, 41, 55, 0.5)", // Gray 800 with opacity
          foreground: "#F3F4F6", // Gray 100
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-glow": "conic-gradient(from 90deg at 50% 50%, #00000000 50%, #8B5CF6 100%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};
