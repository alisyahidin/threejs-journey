const scene = new THREE.Scene()

// red cube
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xFF0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// camera (fov, aspect ration, )
const camera = new THREE.PerspectiveCamera(75, 16 / 9)
camera.position.z = 3
scene.add(camera)

// renderer
const canvas = document.getElementById('canvas')
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().height)

renderer.render(scene, camera)