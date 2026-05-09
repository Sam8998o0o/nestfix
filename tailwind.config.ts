import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#f5f0e8',
          card: '#fffef9',
          2: '#ede8df',
          3: '#e2dbd0',
        },
        ink: {
          DEFAULT: '#1c1c1a',
          2: '#5c5850',
          3: '#9c9890',
        },
        primary: '#2d2d2a',
        accent: {
          DEFAULT: '#c8a96e',
          dark: '#a8894e',
          light: '#f5ecd8',
        },
        border: {
          DEFAULT: '#ddd8cc',
          2: '#ccc6b8',
        },
      },
    },
  },
  plugins: [],
}

export default config
