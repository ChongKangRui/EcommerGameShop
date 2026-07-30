import path from "path"
import tailwindcss from "@tailwindcss/vite"

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { visualizer } from "rollup-plugin-visualizer";


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), visualizer({ open: true })],
  
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    
  },
  optimizeDeps: {
    include: [
    "@ecom/shared/loginDataSchema",
    "@ecom/shared/registerDataSchema",
    "@ecom/shared/profileUpdateDataSchema",
    "@ecom/shared/productSchema",
    "@ecom/shared/type/order",
    "@ecom/shared/type/product",
    "@ecom/shared/type/user",
    "@ecom/shared/type/cart",
    "@ecom/shared/type/checkout",
    "@ecom/shared/type/refund",
    "@ecom/shared/type/search",
  ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
