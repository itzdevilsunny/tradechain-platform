/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          main: '#080A0F',
          secondary: '#0D1117',
          card: '#11161D',
          elevated: '#151B23',
          hover: '#1B222C',
        },
        border: {
          subtle: '#242B35',
          muted: '#1E2631',
          active: '#3A4454',
        },
        trade: {
          buy: '#10B981',
          buyBg: 'rgba(16, 185, 129, 0.1)',
          sell: '#EF4444',
          sellBg: 'rgba(239, 68, 68, 0.1)',
          warning: '#F59E0B',
          warningBg: 'rgba(245, 158, 11, 0.1)',
          chain: '#3B82F6',
          chainBg: 'rgba(59, 130, 246, 0.1)',
          ai: '#8B5CF6',
          aiBg: 'rgba(139, 92, 246, 0.1)',
        },
        tcText: {
          primary: '#F4F7FA',
          secondary: '#8B95A5',
          muted: '#5F6978',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        'fintech': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(36, 43, 53, 0.8)',
        'glow-green': '0 0 15px rgba(16, 185, 129, 0.2)',
        'glow-blue': '0 0 15px rgba(59, 130, 246, 0.2)',
      }
    },
  },
  plugins: [],
}
