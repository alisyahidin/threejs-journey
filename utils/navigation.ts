import { lessonRoutes } from './routes'

const url = new URL(window.location.href)
const currentPageIndex = lessonRoutes.findIndex(route => route.path === url.pathname)

type Navigation = Record<'prev' | 'next', typeof lessonRoutes[number] | undefined>
let navigation: Navigation = {
  prev: lessonRoutes[currentPageIndex - 1] || undefined,
  next: lessonRoutes[currentPageIndex + 1] || undefined,
}

const navigationElement = document.createElement('div')
navigationElement.innerHTML =
  (!!navigation.prev
    ? `<a href="${navigation.prev.path}" class="fixed bottom-0 left-0 bg-purple-500 hover:bg-purple-600 py-2 pr-5 pl-3 text-white fill-white text-base space-x-4 flex items-center rounded-tr-xl">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" class="rotate-180"><path d="M21 12l-18 12v-24z"/></svg>
      <span>${navigation.prev.title}</span>
    </a>`
    : '') +
  (`<span class="fixed bottom-0 left-1/2 -translate-x-1/2 text-white bg-purple-500 px-4 py-1 rounded-t-lg">${lessonRoutes[currentPageIndex].title}</span>`) +
  (!!navigation.next
    ? `<a href="${navigation.next.path}" class="fixed bottom-0 right-0 bg-purple-500 hover:bg-purple-600 py-2 pl-5 pr-3 text-white fill-white text-base space-x-4 flex items-center rounded-tl-xl">
      <span>${navigation.next.title}</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M21 12l-18 12v-24z"/></svg>
    </a>`
    : '').trim()

document.body.appendChild(navigationElement)