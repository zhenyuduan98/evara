import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "amazon-orange": "#FF9900",
        "amazon-dark": "#131921",
        "amazon-light": "#232F3E",
        "amazon-blue": "#007185",
        "amazon-yellow": "#FFA41C",
      },
    },
  },
  plugins: [],
};
export default config;
