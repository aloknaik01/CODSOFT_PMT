/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
extend: {
colors: {
primary: {
50: "#EEF2FF",
100: "#E0E7FF",
400: "#818CF8",
500: "#6366F1", // main brand color
600: "#4F46E5",
700: "#4338CA",
},
slate: {
750: "#293548", // custom mid-tone
},
},
fontFamily: {
sans: ["Inter", "system-ui", "sans-serif"],
mono: ["JetBrains Mono", "Fira Code", "monospace"],
},
animation: {
"fade-in": "fadeIn 0.2s ease-in-out",
"slide-up": "slideUp 0.25s ease-out",
"spin-slow": "spin 2s linear infinite",
},
keyframes: {
fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
slideUp: { "0%": { opacity: 0, transform: "translateY(8px)" },
"100%": { opacity: 1, transform: "translateY(0)" } },
},
},
},
  plugins: [],
}