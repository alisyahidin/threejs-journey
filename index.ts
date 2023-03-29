import routes from './utils/routes'

const linkWrapper = document.createElement('div')
linkWrapper.className = 'flex flex-col'

routes.forEach(page => {
  const link = document.createElement('a')
  link.href = page.path
  link.innerText = page.title

  linkWrapper.appendChild(link)
})

document.getElementById('wrapper')?.appendChild(linkWrapper)
