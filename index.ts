import * as THREE from 'three';
import { lessonRoutes, playgroundRoutes } from './utils/routes'

const threejsJourney = document.getElementById('threejs-journey')!
threejsJourney.classList.add('flex', 'flex-col')

lessonRoutes.slice(1).forEach(page => {
  const link = document.createElement('a')
  link.href = page.path
  link.className = 'text-blue-400 underline'
  link.innerText = page.title

  threejsJourney.appendChild(link)
})

const playground = document.getElementById('playground')!
playground.className = 'flex flex-col'

playgroundRoutes.forEach(page => {
  const link = document.createElement('a')
  link.href = page.path
  link.className = 'text-blue-400 underline'
  link.innerText = page.title

  playground.appendChild(link)
})

const canvas = document.getElementById('home')!;

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(35, canvas.clientWidth / canvas.clientHeight, .1, 1000);
camera.position.z = 2;
camera.position.y = 2;
camera.position.x = 2;

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true
});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshNormalMaterial()
)
scene.add(cube)

camera.lookAt(cube.position)

function loop() {
  cube.rotation.y += 0.01
  renderer.render(scene, camera)
  requestAnimationFrame(loop)
}

loop()