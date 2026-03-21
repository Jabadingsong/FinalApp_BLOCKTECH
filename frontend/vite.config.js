import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
 
export default defineConfig({
  plugins: [react()],
  define: {
    // Web3.js requires this browser polyfill
    global: 'globalThis',
  },
});
