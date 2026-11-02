import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paypal: {
          dark: "#001C48",
          navy: "#003087",
          blue: "#0070E0",
          light: "#009CDE",
          hover: "#005ea6",
          bg: "#F5F8FC",
          card: "#FFFFFF",
          text: "#142B4A",
          muted: "#5E738B",
          border: "#DCE5EF",
          borderLight: "#EEF3F8",
        },
        fintech: {
          success: "#0E8A44",
          successBg: "#EBF8F0",
          warning: "#B46500",
          warningBg: "#FEF7EB",
          danger: "#D92D20",
          dangerBg: "#FEF3F2",
          info: "#026AA2",
          infoBg: "#F0F9FF",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(16, 24, 40, 0.06), 0 1px 2px 0 rgba(16, 24, 40, 0.04)",
        card: "0 4px 6px -1px rgba(0, 48, 135, 0.05), 0 2px 4px -2px rgba(0, 48, 135, 0.05)",
        modal: "0 20px 25px -5px rgba(0, 28, 72, 0.1), 0 8px 10px -6px rgba(0, 28, 72, 0.1)",
      }
    },
  },
  plugins: [],
};

export default config;

