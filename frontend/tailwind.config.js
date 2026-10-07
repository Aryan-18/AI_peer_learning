/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 8-color gradient spectrum from reference image
        refBlue: {
          50: "#EDF6FF",   // Swatch 8: Ultra-light ice blue (light mode bg)
          100: "#CCE6FF",  // Swatch 7: Light powder blue (borders / soft cards)
          200: "#99D1FF",  // Swatch 6: Pastel blue
          300: "#66BDFF",  // Swatch 5: Soft sky
          400: "#38A6FF",  // Swatch 4: Sky blue
          500: "#1A8CFF",  // Swatch 3: Bright electric
          600: "#0A7AFF",  // Swatch 2: Vibrant azure
          700: "#0062FF",  // Swatch 1: Deepest electric cobalt
          800: "#0047BA",
          900: "#002D75",
          950: "#040711",  // Deepest black-blue (dark mode bg)
        },
        apple: {
          blue: "#0062FF",
          electric: "#0A7AFF",
          azure: "#38A6FF",
          neon: "#66BDFF",
          slate: "#0A1128",
          charcoal: "#040711",
          cardDark: "#0B1222",
          cardDarkHover: "#111C35",
          cardLight: "#FFFFFF",
          cardLightHover: "#F6FAFF",
          bgDark: "#040711",
          bgLight: "#EDF6FF",
          ice: "#CCE6FF",
        }
      },
      fontFamily: {
        apple: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          "Inter",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        "apple-card": "0 8px 30px rgba(0, 98, 255, 0.08)",
        "apple-card-hover": "0 14px 40px rgba(0, 98, 255, 0.16)",
        "blue-glow": "0 0 25px rgba(0, 98, 255, 0.4)",
        "blue-glow-strong": "0 0 35px rgba(0, 98, 255, 0.6)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-subtle": "pulseSubtle 3s infinite ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        }
      }
    },
  },
  plugins: [],
}
