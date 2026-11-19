import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const maplibrePath = path.resolve(process.cwd(), 'node_modules/maplibre-gl/dist/maplibre-gl.js').replace(/\\/g, '/');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^maplibre-gl$/, replacement: maplibrePath }
    ]
  },
  server: { 
    port: 3000, 
    host: '0.0.0.0', 
    allowedHosts: ['5173-ibx54v3h83cex342xul8y-6c4a4988.sg2.manus.computer'], 
    proxy: { 
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            if (!res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: { code: 'PROXY_OFFLINE', message: 'Local backend proxy offline' } }));
            }
          });
        }
      }
    } 
  }, 
  build: { 
    outDir: 'dist',
    chunkSizeWarningLimit: 2000
  } 
});


