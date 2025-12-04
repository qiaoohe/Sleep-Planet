import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          'react': path.resolve(__dirname, 'node_modules/react'),
          'react-dom': path.resolve(__dirname, 'node_modules/react-dom')
        },
        dedupe: ['react', 'react-dom']
      },
      optimizeDeps: {
        include: ['react', 'react-dom'],
        force: true
      },
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Split vendor chunks
              if (id.includes('node_modules')) {
                // Ensure React and all React-dependent packages are in react chunk
                // This includes all packages that import from 'react'
                if (
                  id.includes('react') || 
                  id.includes('react-dom') || 
                  id.includes('scheduler') ||
                  id.includes('react-jsx-runtime') ||
                  id.includes('@react-spring') ||
                  id.includes('@use-gesture') ||
                  id.includes('zustand') ||
                  id.includes('tunnel-rat') ||
                  id.includes('suspend-react') ||
                  id.includes('react-composer') ||
                  id.includes('lucide-react') ||
                  id.includes('its-fine') ||
                  id.includes('prop-types')
                ) {
                  return 'react';
                }
                if (id.includes('three') || id.includes('@react-three')) {
                  return 'three';
                }
                if (id.includes('@google/genai')) {
                  return 'gemini';
                }
                // Only put truly non-React dependencies in vendor
                return 'vendor';
              }
            }
          },
          external: []
        },
        // Ensure proper asset handling
        assetsInlineLimit: 4096
      }
    };
});
