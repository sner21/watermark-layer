import {fileURLToPath, URL} from 'node:url'
import react from "@vitejs/plugin-react";
import {defineConfig} from 'vite'

const config = {}

if (!process.env?.NODE_WEB) {
    console.log(1111)
    config.build = {
        copyPublicDir:false,
        minify: true,
        lib: {
            entry: 'package/markLayer.js',
            name: "markLayer",
            fileName: 'index',
            formats: ['es']
        }
    }
}
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
    ],
    ...config,
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
})
