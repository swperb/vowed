/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // VowKeeper brand palette — warm but not saccharine
        brand: {
          50:  "#fdf8f6",
          100: "#f9ede8",
          200: "#f2d5ca",
          300: "#e6b09e",
          400: "#d4836a",
          500: "#b85e45",
          600: "#9a4733",
          700: "#7d3827",
          800: "#662d1e",
          900: "#542419",
        },
        // Sage green accent for "done / success"
        sage: {
          50:  "#f2f7f4",
          100: "#dcede3",
          200: "#b9dac8",
          300: "#8dc0a8",
          400: "#5fa082",
          500: "#3d8266",
          600: "#2d6a52",
          700: "#245641",
          800: "#1d4535",
          900: "#17382c",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.2s ease-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
