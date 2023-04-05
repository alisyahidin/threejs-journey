import * as THREE from 'three';
import GUI from 'lil-gui';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class Scene extends THREE.Scene {
  debugger: GUI = new GUI();
  camera: THREE.PerspectiveCamera = null;
  renderer: THREE.WebGLRenderer = null;
  orbitals: OrbitControls = null;
  width = window.innerWidth;
  height = window.innerHeight;

  constructor(debug: boolean = true, addGridHelper: boolean = true) {
    super()

    // setup camera
    this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, .1, 1000);
    this.camera.position.z = 12;
    this.camera.position.y = 12;
    this.camera.position.x = 12;

    // setup renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('canvas') as HTMLCanvasElement,
      alpha: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // add window resizing
    Scene.addWindowResizing(this.camera, this.renderer);

    // sets up the camera's orbital controls
    this.orbitals = new OrbitControls(this.camera, this.renderer.domElement)
    this.orbitals.enableDamping = true

    // set the background color
    this.background = new THREE.Color(0x000);

    const ambientLight = new THREE.AmbientLight(0xb9d5ff, 0.2)
    this.add(ambientLight)

    const moonLight = new THREE.DirectionalLight(0xb9d5ff, 0.2)
    moonLight.position.set(4, 5, -2)
    this.add(moonLight)

    const doorLight = new THREE.PointLight(0xff7d46, 1, 7)
    doorLight.position.set(0, 2.2, 2.7)
    this.add(doorLight)

    // Creates the geometry + materials
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 18),
      new THREE.MeshStandardMaterial({ color: 0x1d963b })
    )
    plane.rotation.x = -Math.PI * 0.5
    this.add(plane)

    const house = new THREE.Group()
    this.add(house)

    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2.5, 4),
      new THREE.MeshStandardMaterial({ color: '#ac8e82' })
    )
    walls.position.y = 1.25
    house.add(walls)

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3.5, 1, 4),
      new THREE.MeshStandardMaterial({ color: '#b35f45' })
    )
    roof.rotation.y = Math.PI * 0.25
    roof.position.y = 2.5 + 0.5
    house.add(roof)

    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.MeshStandardMaterial({ color: '#aa7b7b' })
    )
    door.position.y = 1
    door.position.z = 2 + 0.01
    house.add(door)

    // Graves
    const graves = new THREE.Group()
    this.add(graves)

    const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
    const graveMaterial = new THREE.MeshStandardMaterial({ color: '#b2b6b1' })

    for (let i = 0; i < 25; i++) {
      const radius = 3 + Math.random() * 5
      const x = Math.cos(i + 1) * radius
      const z = Math.sin(i + 1) * radius

      // Create the mesh
      const grave = new THREE.Mesh(graveGeometry, graveMaterial)

      // Position
      grave.position.set(x, 0.3, z)

      // Rotation
      grave.rotation.z = (Math.random() - 0.5) * 0.2
      grave.rotation.y = (Math.random() - 0.5) * 0.4

      // Add to the graves container
      graves.add(grave)
    }

    // setup Debugger
    if (debug) {
      const cameraGroup = this.debugger.addFolder('Camera');
      cameraGroup.add(this.camera, 'fov', 20, 80);
      cameraGroup.add(this.camera, 'zoom', 0, 1)
      cameraGroup.open();
    }
  }

  static addWindowResizing(camera: THREE.PerspectiveCamera, renderer: THREE.Renderer) {
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize, false);
  }
}

const scene = new Scene();

function loop() {
  scene.camera.updateProjectionMatrix();
  scene.orbitals.update()
  scene.renderer.render(scene, scene.camera);
  requestAnimationFrame(loop);
}

loop()