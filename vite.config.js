const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
  // For GitHub Pages deployment: https://charles191911919199191919191.github.io/LFC-lawfirm/
  base: process.env.NODE_ENV === 'production' ? '/LFC-lawfirm/' : '/',
  root: 'client',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'axios', 'zustand'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      }
    }
  }
});
