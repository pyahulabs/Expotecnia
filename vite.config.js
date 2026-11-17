import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const src = (path) => fileURLToPath(new URL(`./src/${path}`, import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // `npm run build:demo`: todo en un solo archivo (sin Firebase ni servidor), para compartir como demo
  const demo = mode === 'demo'

  return {
    plugins: [react(), tailwindcss()],
    base: demo ? './' : '/',
    resolve: {
      alias: [
        ...(demo
          ? [
              { find: /^firebase\/(app|firestore)$/, replacement: src('firebase/stub.js') },
              { find: '@fontsource-variable/inter/wght.css', replacement: src('demo-fonts.css') },
            ]
          : []),
        { find: '@', replacement: src('').replace(/\/$/, '') },
      ],
    },
    define: demo ? { 'import.meta.env.VITE_FIREBASE_API_KEY': '""' } : {},
    server: {
      host: true, // permite abrir la app desde el celular en la misma red (útil en la feria)
      port: 5173,
    },
    build: demo
      ? {
          outDir: 'dist-demo',
          assetsInlineLimit: 100_000_000, // fuentes embebidas en el CSS
          cssCodeSplit: false,
          chunkSizeWarningLimit: 5000,
          rolldownOptions: { output: { codeSplitting: false } },
        }
      : {
          chunkSizeWarningLimit: 700,
          rolldownOptions: {
            output: {
              // Librerías grandes en archivos separados: el navegador las cachea entre versiones
              codeSplitting: {
                groups: [
                  { name: 'firebase', test: /node_modules[\\/](@firebase|firebase)[\\/]/, priority: 30 },
                  { name: 'graficos', test: /node_modules[\\/](recharts|d3-|victory-vendor|decimal\.js-light|es-toolkit|immer|reselect|@reduxjs|redux|react-redux)/, priority: 20 },
                  { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/, priority: 20 },
                  { name: 'animaciones', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/, priority: 20 },
                ],
              },
            },
          },
        },
  }
})
