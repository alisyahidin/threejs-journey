import { resolve } from 'path'
import { defineConfig } from 'vite'
import fs from 'node:fs'

const lessons = fs.readdirSync('lessons').reduce((prev, current) => {
  prev[`${current}`] = `lessons/${current}/index.html`;
  return { ...prev };
}, {})

const playground = fs.readdirSync('playground').reduce((prev, current) => {
  prev[`${current}`] = `playground/${current}/index.html`;
  return { ...prev };
}, {})

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...lessons,
        ...playground,
      },
    },
  },
})