/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          background: '#050a15',
          panel: '#0a1224',
          primary: '#00f0ff',
          secondary: '#7000ff',
          accent: '#ff003c',
          text: '#e0e7ff',
          muted: '#64748b',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-grid': `
          linear-gradient(rgba(0, 240, 255, 0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 240, 255, 0.06) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'cyber-grid': '40px 40px',
      },
      boxShadow: {
        'neon-blue': '0 0 10px rgba(0, 240, 255, 0.4), 0 0 20px rgba(0, 240, 255, 0.2)',
        'neon-purple': '0 0 10px rgba(112, 0, 255, 0.4), 0 0 20px rgba(112, 0, 255, 0.2)',
        'neon-red': '0 0 10px rgba(255, 0, 60, 0.4), 0 0 20px rgba(255, 0, 60, 0.2)',
        'neon-green': '0 0 10px rgba(74, 222, 128, 0.4), 0 0 20px rgba(74, 222, 128, 0.2)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'flicker': 'flicker 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%, 95%, 100%': { opacity: '1' },
          '96%': { opacity: '0.8' },
          '97%': { opacity: '1' },
          '98%': { opacity: '0.6' },
          '99%': { opacity: '1' },
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      borderColor: {
        'cyber-primary': 'rgba(0, 240, 255, 0.3)',
        'cyber-secondary': 'rgba(112, 0, 255, 0.3)',
        'cyber-accent': 'rgba(255, 0, 60, 0.3)',
      },
    },
  },
  plugins: [],
};
