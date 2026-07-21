import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: "#D4FF00",
          light: "#EEFFAA",
        },
        surface: "#F7F7F7",
        dark: "#171717",
        muted: "#C4C4C4",
      },
      fontFamily: {
        pretendard: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
