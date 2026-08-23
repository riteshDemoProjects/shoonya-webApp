import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The dev server proxies /api to the FastAPI backend, so the frontend makes
// same-origin requests (no CORS needed in development).
export default defineConfig({
  plugins: [react()],
  server: {
    // allow the dev server to be reached from the network and accept the
    // ngrok hostname in the Host header
    host: true,
    port: 5173,
    allowedHosts: ["localhost", "distant-vanish-debate.ngrok-free.dev"],
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
      },
    },
  },
});
