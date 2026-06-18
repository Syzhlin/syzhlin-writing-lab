import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'api-dev-server',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && (req.url === '/api' || req.url.startsWith('/api/'))) {
              const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
              const pathname = url.pathname;
              
              try {
                if (pathname === '/api/health') {
                  const mod = await server.ssrLoadModule('./api/health.ts');
                  return mod.default(req, res);
                }
                if (pathname === '/api/revise') {
                  const mod = await server.ssrLoadModule('./api/revise.ts');
                  return mod.default(req, res);
                }
                if (pathname === '/api/proofread') {
                  const mod = await server.ssrLoadModule('./api/proofread.ts');
                  return mod.default(req, res);
                }
                if (pathname === '/api/docs-export') {
                  const mod = await server.ssrLoadModule('./api/docs-export.ts');
                  return mod.default(req, res);
                }
              } catch (err: any) {
                console.error("Vite Local API execution error:", err);
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ error: err.message || "Local API Dev Server Error" }));
              }
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
