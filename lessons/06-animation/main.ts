import * as THREE from 'three';
import GUI from 'lil-gui';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap'

class Scene extends THREE.Scene {
  debugger: GUI = null;
  camera: THREE.PerspectiveCamera = null;
  renderer: THREE.WebGLRenderer = null;
  orbitals: OrbitControls = null;
  lights: Array<THREE.Light> = [];
  lightCount: number = 6;
  lightDistance: number = 6;
  width = window.innerWidth;
  height = window.innerHeight;
  cubes: Array<THREE.Mesh> = [];
  time: number = Date.now();
  clock: THREE.Clock = new THREE.Clock();

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

    // Adds an origin-centered grid for visual reference
    if (addGridHelper) {
      this.add(new THREE.GridHelper(10, 10, 0xfafafa));
      this.add(new THREE.AxesHelper(3))
    }

    // set the background color
    this.background = new THREE.Color(0x000);

    // create the lights
    for (let i = 0; i < this.lightCount; i++) {
      // Positions evenly in a circle pointed at the origin
      const light = new THREE.PointLight(0xffffff, 1);
      let lightX = this.lightDistance * Math.sin(Math.PI * 2 / this.lightCount * i);
      let lightZ = this.lightDistance * Math.cos(Math.PI * 2 / this.lightCount * i);

      // Create a light
      light.position.set(lightX, this.lightDistance, lightZ)
      light.lookAt(0, 0, 0)

      this.add(light);

      this.lights.push(light);
      // Visual helpers to indicate light positions
      this.add(new THREE.PointLightHelper(light, .5, 0xff9900));
    }

    // Creates the geometry + materials
    const colors = [0xff9900, 0xff0000, 0x0099FF, 0xFFC0CB]
    for (let i = 0; i < colors.length; i++) {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshPhongMaterial({ color: colors[i] })
      );

      cube.position.x = ((i - 1) * 1.5) - colors.length / 4

      this.cubes.push(cube)
      this.add(cube)
    }

    // setup Debugger
    if (debug) {
      this.debugger = new GUI();
      const lightGroup = this.debugger.addFolder('Lights');
      for (let i = 0; i < this.lights.length; i++) {
        lightGroup.add(this.lights[i], 'visible');
      }
      lightGroup.open();

      // Add camera to debugger
      const cameraGroup = this.debugger.addFolder('Camera');
      cameraGroup.add(this.camera, 'fov', 20, 80);
      cameraGroup.add(this.camera, 'zoom', 0, 1)
      cameraGroup.open();
    }
  }

  rotateCubeUsingDeltaTime() {
    const currentTime = Date.now()
    const deltaTime = currentTime - this.time
    this.time = currentTime

    // this makes cube rotating at the same speed regardless difference frame rate
    this.cubes[0].rotation.y += 0.001 * deltaTime
  }

  rotateCubeUsingElapsedTime() {
    this.cubes[1].rotation.y = this.clock.getElapsedTime()
  }

  moveCubeUsingSinCos() {
    const elapsedTime = this.clock.getElapsedTime()
    this.cubes[2].position.y = Math.sin(elapsedTime)
  }

  animateUsingGreenSock() {
    console.log('test')
    gsap.to(this.cubes[3].position, { duration: 1, delay: 1, x: 6 })
    gsap.to(this.cubes[3].position, { duration: 1, delay: 3, x: 2 })
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

scene.animateUsingGreenSock()

function loop() {
  scene.camera.updateProjectionMatrix();
  scene.renderer.render(scene, scene.camera);
  scene.orbitals.update()
  scene.rotateCubeUsingDeltaTime()
  scene.rotateCubeUsingElapsedTime()
  scene.moveCubeUsingSinCos()
  requestAnimationFrame(loop);
}

loop()