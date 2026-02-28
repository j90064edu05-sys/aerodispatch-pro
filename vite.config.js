import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/aerodispatch-pro/', // 這裡填入您的 GitHub Repository 名稱
})
