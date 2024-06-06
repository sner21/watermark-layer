import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {AntDesignVueResolver} from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
const config = {}
if (!process.env?.web) {
    config.build = {
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
        vue(),
        Components({
            resolvers: [
                AntDesignVueResolver({
                    importStyle: false,
                }),
            ],
        }),
    ],
    ...config,
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
})
