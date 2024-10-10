/// <reference types="vitest" />

import {defineConfig} from 'vite'
import Vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    plugins: [Vue()],
    test: {
        globals: true,
        environment: 'happy-dom',
        exclude: [
            '**/node_modules/**',
            '**/e2e/**',
            '**/dist/**',
            '**/cypress/**',
            '**/.{idea,git,cache,output,temp}/**',
            '**/{karma,rollup,webpack,vite,vitest,jest}.config.*',
            '**/{ava,babel,nyc,cypress,tsup,build}.config.*',
        ],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '../src'),
        },
    },
})
