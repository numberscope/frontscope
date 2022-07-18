import {fileURLToPath, URL} from 'url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        target: 'esnext',
    },
    preview: {
        port: 5050,
        proxy: {
            '^/doc$': {
                target: 'http://localhost:5050/doc/index.html',
                followRedirects: true,
            },
        },
    },
})
