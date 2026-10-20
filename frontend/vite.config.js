import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), 
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api' : {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true
      }
    }
  }
})

// Esta configuración es para el servidor de desarrollo de Vite. Cunado se publique la aplicación se tendrá que
// Definir el enrutamiento de producción por separado.
