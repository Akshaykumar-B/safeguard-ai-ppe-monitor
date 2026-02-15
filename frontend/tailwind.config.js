/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        navy: {
          DEFAULT: '#0f172a',
          light: '#1e293b',
          dark: '#020617',
        },
        cyan: {
          DEFAULT: '#00eaff',
          dim: 'rgba(0, 234, 255, 0.5)',
          faint: 'rgba(0, 234, 255, 0.1)',
        },
        electric: {
          DEFAULT: '#0084ff',
          dim: 'rgba(0, 132, 255, 0.5)',
        },
        alert: '#ff3333',
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        'glow-cyan': '0 0 20px rgba(0, 234, 255, 0.4), 0 0 40px rgba(0, 234, 255, 0.2)',
        'glow-cyan-strong': '0 0 30px rgba(0, 234, 255, 0.6), 0 0 60px rgba(0, 234, 255, 0.4)',
        'glow-blue': '0 0 20px rgba(0, 132, 255, 0.4), 0 0 40px rgba(0, 132, 255, 0.2)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "scanline": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "10%": { opacity: "0.3" },
          "90%": { opacity: "0.3" },
          "100%": { transform: "translateY(100vh)", opacity: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 20px rgba(0, 234, 255, 0.3), 0 0 40px rgba(0, 234, 255, 0.2)" 
          },
          "50%": { 
            boxShadow: "0 0 30px rgba(0, 234, 255, 0.5), 0 0 60px rgba(0, 234, 255, 0.3)" 
          },
        },
        "beam-sweep": {
          "0%": { transform: "translateX(-100%) rotate(25deg)", opacity: "0" },
          "10%": { opacity: "0.4" },
          "90%": { opacity: "0.4" },
          "100%": { transform: "translateX(200%) rotate(25deg)", opacity: "0" },
        },
        "detection-box": {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "20%": { opacity: "0.15", transform: "scale(1)" },
          "80%": { opacity: "0.15", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.8)" },
        },
        "grid-move": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "50px 50px" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "scanline": "scanline 6s linear infinite",
        "float": "float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "beam-sweep": "beam-sweep 8s ease-in-out infinite",
        "detection-box": "detection-box 4s ease-in-out infinite",
        "grid-move": "grid-move 20s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
