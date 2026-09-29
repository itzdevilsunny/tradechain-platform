import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dns from 'node:dns';

// Ensure IPv4 first on Windows to avoid Node 17+ proxy ETIMEDOUT
dns.setDefaultResultOrder('ipv4first');

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'GROQ_', 'GEMINI_', 'SUPABASE_', 'UPSTOX_', 'RAPIDAPI_']);
  const getEnv = (k: string) => env[k] || process.env[k] || '';

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'GROQ_', 'GEMINI_', 'SUPABASE_', 'UPSTOX_', 'RAPIDAPI_'],
    define: {
      'import.meta.env.VITE_GROQ_API_KEY': JSON.stringify(getEnv('VITE_GROQ_API_KEY') || getEnv('GROQ_API_KEY')),
      'import.meta.env.GROQ_API_KEY': JSON.stringify(getEnv('GROQ_API_KEY') || getEnv('VITE_GROQ_API_KEY')),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(getEnv('VITE_GEMINI_API_KEY') || getEnv('GEMINI_API_KEY')),
      'import.meta.env.GEMINI_API_KEY': JSON.stringify(getEnv('GEMINI_API_KEY') || getEnv('VITE_GEMINI_API_KEY')),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL')),
      'import.meta.env.SUPABASE_URL': JSON.stringify(getEnv('SUPABASE_URL') || getEnv('VITE_SUPABASE_URL')),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY')),
      'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(getEnv('SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY')),
      'import.meta.env.VITE_UPSTOX_ACCESS_TOKEN': JSON.stringify(getEnv('VITE_UPSTOX_ACCESS_TOKEN') || getEnv('UPSTOX_ACCESS_TOKEN')),
      'import.meta.env.UPSTOX_ACCESS_TOKEN': JSON.stringify(getEnv('UPSTOX_ACCESS_TOKEN') || getEnv('VITE_UPSTOX_ACCESS_TOKEN')),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  server: {
    port: 3000,
    open: false,
    host: true,
    allowedHosts: true,
    proxy: {
      '/api/yahoo': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      },
      '/api/upstox': {
        target: 'https://api.upstox.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/upstox/, '')
      },
      '/api/groq': {
        target: 'https://api.groq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/groq/, '')
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 10000,
    allowedHosts: true,
    proxy: {
      '/api/yahoo': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      },
      '/api/upstox': {
        target: 'https://api.upstox.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/upstox/, '')
      },
      '/api/groq': {
        target: 'https://api.groq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/groq/, '')
      }
    }
  }
};
});
