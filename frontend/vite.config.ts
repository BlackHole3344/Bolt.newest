import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  } , 
  server : {
  headers: {
    'Cross-Origin-Embedder-Policy': 'require-corp' , 
    'Cross-Origin-Opener-Policy': 'same-origin' ,   
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': 'http://localhost:5173', // adjust port if different
  },
  cors: {
    origin: 'http://localhost:5173', // adjust port if different
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }
}
});
