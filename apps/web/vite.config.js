import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          router: ['react-router-dom']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production'
          ? 'https://us-central1-app-arch-6c99b.cloudfunctions.net'
          : 'http://localhost:5001/app-arch-6c99b/us-central1',
        changeOrigin: true,
        // Não reescrever o caminho: mantém /api prefixado para alcançar a função 'api'
        // Ex.: /api/requests -> .../us-central1/api/requests
        // rewrite: (path) => path,
      },
    },
  },
});
