export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        /* Surfaces */
        void: "#0b0c0e",
        abyss: "#0e111b",
        "deep-sea": "#0d172b",
        "cobalt-panel": "#12244f",

        /* Text */
        quartz: "#ffffff",
        ash: "#abaebb",
        mist: "#c7c9d1",

        /* Accents */
        "signal-blue": "#2862d7",
        "pulse-violet": "#305fbd",
        "frosted-lilac": "#85a6e9",

        /* Borders */
        "obsidian-edge": "#172540",
        inkline: "#151e32",
        "sapphire-hairline": "#24375a",
        slate: "#3c3f44",

        /* Keep existing names too */
        primary: "#2862d7",
        secondary: "#305fbd",
        success: "#2862d7",
        danger: "#ff7dda",
        warning: "#85a6e9",
      },

      backgroundColor: {
        canvas: "#0e111b",
        elevated: "#0d172b",
        highlight: "#12244f",
      },

      fontFamily: {
        inter: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],

        figtree: [
          "Figtree",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],

        mono: [
          "IBM Plex Mono",
          "ui-monospace",
          "monospace",
        ],

        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },

      fontSize: {
        xs: ["12px", { lineHeight: "1.25", letterSpacing: "-0.02em" }],
        sm: ["14px", { lineHeight: "1.25", letterSpacing: "-0.02em" }],
        base: ["16px", { lineHeight: "1.5", letterSpacing: "-0.32px" }],
        lg: ["18px", { lineHeight: "1.5", letterSpacing: "-0.36px" }],
        xl: ["20px", { lineHeight: "1.38", letterSpacing: "-0.54px" }],
        "2xl": ["28px", { lineHeight: "1.25", letterSpacing: "-0.56px" }],
        "3xl": ["36px", { lineHeight: "1.13", letterSpacing: "-0.72px" }],
        "4xl": ["48px", { lineHeight: "1.13", letterSpacing: "-0.96px" }],
        "5xl": ["64px", { lineHeight: "1", letterSpacing: "-1.28px" }],
      },

      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "28px",
        "4xl": "32px",
        "5xl": "40px",
        "6xl": "64px",
        "7xl": "80px",
        "8xl": "104px",
      },

      borderRadius: {
        none: "0px",
        xs: "2px",
        sm: "8px",
        md: "12px",
        full: "9999px",
      },

      boxShadow: {
        md: "rgba(0, 0, 0, 0.2) 0px 3px 16px 0px",
        xl: "rgba(0, 0, 0, 0.5) 0px 4px 30px 0px",
        "xl-2":
          "rgba(0, 0, 0, 0.34) 0px 20px 35px 0px, rgba(0, 0, 0, 0.25) 0px 4px 13px 0px",
        "inner-glow":
          "rgba(255, 255, 255, 0.35) 0px 2px 14px 0px",
        subtle:
          "rgba(0, 0, 0, 0.15) 0px 0px 0px 1px",
      },

      backgroundImage: {
        "aurora-purple":
          "radial-gradient(79.43% 95.88% at 38.94% -53.46%, rgba(98, 95, 255, 0.38) 0px, rgba(0, 0, 0, 0))",

        "plasma-pink":
          "radial-gradient(27.99% 22.08% at 72.13% 103.46%, rgba(255, 125, 218, 0.33) 0px, rgba(0, 0, 0, 0))",

        "gradient-blue-violet":
          "linear-gradient(90deg, #305fbd, #625fff)",
      },

      maxWidth: {
        container: "1200px",
      },
    },
  },

  plugins: [],
}