import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: "#D4FF00",
          light: "#EEFFAA",
          vivid: "#CCFF00",
          pale: "#F4FFD6",
        },
        surface: "#F7F7F7",
        dark: "#171717",
        muted: "#C4C4C4",
        ink: "#2A2A2A",
        subtext: "#737373",
        line: "#EAEBEC",
        error: "#FF7BA2",
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
