import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#FFF9F0',
        sketch: {
          dark: '#2B2B2B',
          gray: '#828282',
          blue: '#5B8FF9',
          red: '#FF6B6B',
          green: '#51CF66',
        },
      },
      fontFamily: {
        sketch: ['var(--font-gaegu)', 'var(--font-caveat)', 'Comic Sans MS', 'cursive'],
        pen: ['var(--font-nanum-pen)', 'cursive'],
        hand: ['var(--font-caveat)', 'cursive'],
      },
    },
  },
  plugins: [],
} satisfies Config;
