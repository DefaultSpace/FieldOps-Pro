import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    base: process.env.SITE_DEPLOY === '1' ? '/' : '/FieldOps-Pro/',
    plugins: [react()]
})
