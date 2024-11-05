/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./entrypoints/popup/index.html",
    "./entrypoints/**/*.{js,ts,vue,jsx,tsx}",
	  "./components/**/*.{js,ts,vue,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

