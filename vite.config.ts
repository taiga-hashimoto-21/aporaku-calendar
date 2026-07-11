import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import http from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";

const SPA_PREFIXES = [
  "/dashboard",
  "/calendars",
  "/account",
  "/settings",
  "/admin",
  "/onboarding",
];

const VITE_INTERNAL_PREFIXES = [
  "/@",
  "/src",
  "/node_modules",
  "/assets",
  "/vite-src",
  "/@vite",
  "/@react-refresh",
  "/@fs",
];

const NEXT_TARGET = { host: "localhost", port: 3003 };

function shouldHandleAsSpa(pathname: string): boolean {
  return SPA_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isViteInternal(pathname: string): boolean {
  return VITE_INTERNAL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix)
  );
}

/** public/ の静的ファイルは Vite に任せる（拡張子あり） */
function isStaticAsset(pathname: string): boolean {
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

function shouldPassToVite(pathname: string): boolean {
  return isViteInternal(pathname) || shouldHandleAsSpa(pathname) || isStaticAsset(pathname);
}

function proxyToNext(req: IncomingMessage, res: ServerResponse) {
  const headers = { ...req.headers, host: `${NEXT_TARGET.host}:${NEXT_TARGET.port}` };
  const proxyReq = http.request(
    {
      hostname: NEXT_TARGET.host,
      port: NEXT_TARGET.port,
      path: req.url,
      method: req.method,
      headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on("error", (err) => {
    console.error("[vite] Next proxy error:", err.message);
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    }
    res.end("Bad Gateway");
  });

  req.pipe(proxyReq);
}

/**
 * Public booking slugs など SPA 以外の HTTP パスを Next (3003) へ転送。
 * 注意: WebSocket upgrade は絶対に横取りしないこと。
 * Vite HMR は `/` で upgrade するため、奪うと
 * 「server connection lost」→ フルリロード無限ループになる。
 */
function nextFallbackProxyPlugin(): Plugin {
  return {
    name: "next-fallback-proxy",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? "").split("?")[0] || "/";

        if (shouldPassToVite(pathname)) {
          return next();
        }

        proxyToNext(req, res);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), nextFallbackProxyPlugin()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    port: 3002,
    host: "0.0.0.0",
    proxy: {
      "/api": { target: "http://localhost:3003", changeOrigin: true },
      "/login": { target: "http://localhost:3003", changeOrigin: true },
      "/signup": { target: "http://localhost:3003", changeOrigin: true },
      "/team": { target: "http://localhost:3003", changeOrigin: true },
      "/_next": { target: "http://localhost:3003", changeOrigin: true },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
  },
});
