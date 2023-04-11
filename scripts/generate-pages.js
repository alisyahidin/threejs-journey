const fs = require('node:fs')
const path = require('path')

const formatTitle = (str) => {
  return str
    .split('-')
    .map(v => v.charAt(0).toUpperCase() + v.slice(1))
    .join(' ');
}

const home = {
  title: 'Home',
  path: '/',
}

const lessons = fs.readdirSync(path.join(process.cwd(), 'lessons'))
  .map(item => {
    return {
      title: formatTitle(item),
      path: `/lessons/${item}/index.html`
    }
  })

const lessonPaths = JSON.stringify([home, ...lessons], null, 2)

const playground = fs.readdirSync(path.join(process.cwd(), 'playground'))
  .map(item => {
    return {
      title: formatTitle(item),
      path: `/playground/${item}/index.html`
    }
  })

const playgroundPaths = JSON.stringify(playground, null, 2)

const data = `
export const lessonRoutes = ${lessonPaths} as const

export const playgroundRoutes = ${playgroundPaths} as const
`.trim()

fs.writeFile('utils/routes.ts', data, { encoding: 'utf-8' }, () => null)