
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          muted: "hsl(var(--success-muted))",
          "muted-foreground": "hsl(var(--success-muted-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          muted: "hsl(var(--warning-muted))",
          "muted-foreground": "hsl(var(--warning-muted-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          muted: "hsl(var(--info-muted))",
          "muted-foreground": "hsl(var(--info-muted-foreground))",
        },
        // Cores personalizadas baseadas na paleta fornecida, agora com mais harmonia
        turquesa: {
          DEFAULT: "#029daf",
          light: "#33b3c3",
          dark: "#01778a",
        },
        vermelho: {
          DEFAULT: "#AF5B5B", 
          light: "#c27a7a",
          dark: "#8d4848",
        },
        offwhite: {
          DEFAULT: "#F6F4F3", 
          dark: "#e0dcda",
        },
        azul: {
          DEFAULT: "#276FBF", 
          light: "#488ad3",
          dark: "#1e5899",
        },
        azulEscuro: {
          DEFAULT: "#183059", 
          light: "#2a4980",
          dark: "#122445",
        },
        textoEscuro: {
          DEFAULT: "#232323", 
          light: "#3d3d3d",
          dark: "#1a1a1a",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        heading: "var(--font-heading)",
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
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "fade-out": {
          "0%": { 
            opacity: "1",
            transform: "translateY(0)" 
          },
          "100%": { 
            opacity: "0",
            transform: "translateY(10px)" 
          }
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" }
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" }
        },
        "pulse-gentle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" }
        },
        "shimmer": {
          "0%": { 
            backgroundPosition: "-200% 0" 
          },
          "100%": { 
            backgroundPosition: "200% 0" 
          }
        },
        "scale-in": {
          "0%": { 
            transform: "scale(0.95)",
            opacity: "0" 
          },
          "100%": { 
            transform: "scale(1)",
            opacity: "1" 
          }
        },
        "scale-out": {
          "0%": { 
            transform: "scale(1)",
            opacity: "1" 
          },
          "100%": { 
            transform: "scale(0.95)",
            opacity: "0" 
          }
        },
        "border-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 5px hsl(var(--primary)/0.3)",
            borderColor: "hsl(var(--primary)/0.3)"
          },
          "50%": { 
            boxShadow: "0 0 15px hsl(var(--primary)/0.6)",
            borderColor: "hsl(var(--primary)/0.6)"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-out",
        "pulse-gentle": "pulse-gentle 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite linear",
        "scale-in": "scale-in 0.2s ease-out",
        "scale-out": "scale-out 0.2s ease-out",
        "border-glow": "border-glow 1.5s ease-in-out infinite",
        "enter": "fade-in 0.3s ease-out, scale-in 0.2s ease-out",
        "exit": "fade-out 0.3s ease-out, scale-out 0.2s ease-out"
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(0, 0, 0, 0.08)',
        'card': '0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 5px 10px -5px rgba(0, 0, 0, 0.04)',
        'inner-glow': 'inset 0 0 15px 0 rgba(0, 0, 0, 0.1)',
        'highlight': '0 0 15px 2px hsl(var(--primary)/0.3)',
      },
      typography: {
        DEFAULT: {
          css: {
            h1: {
              color: 'hsl(var(--foreground))',
              fontWeight: '700',
            },
            h2: {
              color: 'hsl(var(--foreground))',
              fontWeight: '600',
            },
            h3: {
              color: 'hsl(var(--foreground))',
              fontWeight: '600',
            },
            a: {
              color: 'hsl(var(--primary))',
              '&:hover': {
                color: 'hsl(var(--primary)/0.8)',
              },
            },
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-subtle': 'linear-gradient(to right, hsl(var(--primary)/0.05), hsl(var(--primary)/0.1))',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
        'dots': 'radial-gradient(circle, hsl(var(--primary)/0.15) 1px, transparent 1px)',
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(8px)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
