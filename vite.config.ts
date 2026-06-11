import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// Report-only CSP, mirroring nginx-csp.conf.example (the prod artifact - see that
// file for the origin inventory and tightening steps). Report-only NEVER blocks;
// violations show up in the browser console so drift is caught during dev.
// Dev-only additions vs the nginx version:
//  - 'unsafe-inline' in script-src (@vitejs/plugin-react injects an inline
//    refresh preamble in dev; the built app ships no inline scripts)
//  - localhost/127.0.0.1 (local backend via .env.local + Vite HMR websocket)
const cspReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://api.edrilla.com https://placehold.co https://*.mm.bing.net https://static.vecteezy.com https://www.facebook.com http://localhost:* http://127.0.0.1:*",
  "media-src 'self' blob: data: https://api.edrilla.com http://localhost:* http://127.0.0.1:*",
  "connect-src 'self' https://api.edrilla.com wss://api.edrilla.com http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:*",
  "frame-src 'self' https://www.youtube.com https://platform.twitter.com https://www.facebook.com",
  "worker-src 'self' blob:",
].join("; ");

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    host: true,
    port: 5174,
    allowedHosts: ["admin.edrilla.com"],
    headers: {
      "Content-Security-Policy-Report-Only": cspReportOnly,
    },
  },
  preview: {
    headers: {
      "Content-Security-Policy-Report-Only": cspReportOnly,
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Stable vendor chunks: app-code changes no longer invalidate the
        // cached react/redux/editor/chart/calendar bundles on every deploy.
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@editorjs")) return "vendor-editorjs";
          if (id.includes("apexcharts")) return "vendor-charts"; // apexcharts + react-apexcharts
          if (id.includes("@fullcalendar")) return "vendor-calendar";
          if (id.includes("redux")) return "vendor-state"; // redux, @reduxjs/toolkit, react-redux
          if (
            /node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)
          ) {
            return "vendor-react";
          }
          return undefined;
        },
      },
    },
  },
});
