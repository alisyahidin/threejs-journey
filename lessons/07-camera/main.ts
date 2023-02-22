import * as THREE from 'three';
import GUI from 'lil-gui';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class Scene extends THREE.Scene {
  debugger: GUI = null;
  camera: THREE.PerspectiveCamera = null;
  renderer: THREE.WebGLRenderer = null;
  orbitals: OrbitControls = null;
  lights: Array<THREE.Light> = [];
  lightCount: number = 6;
  lightDistance: number = 3;
  width = window.innerWidth;
  height = window.innerHeight;
  cube: THREE.Mesh = null;
  clock: THREE.Clock = new THREE.Clock();
  cursor: { x: number, y: number } = { x: 0, y: 0 }

  constructor(debug: boolean = true, addGridHelper: boolean = true) {
    super()

    // setup camera
    this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, .1, 100);
    // const aspectRatio = this.width / this.height;
    // this.camera = new THREE.OrthographicCamera(-1 * aspectRatio, 1 * aspectRatio, 1, -1, .1, 1000)
    // this.camera.position.z = 7;
    // this.camera.position.y = 7;
    // this.camera.position.x = 7;

    // setup renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('canvas') as HTMLCanvasElement,
      alpha: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // add window resizing
    Scene.addWindowResizing(this.camera, this.renderer);
    Scene.addCursorMove(this.cursor);

    // sets up the camera's orbital controls
    // this.orbitals = new OrbitControls(this.camera, this.renderer.domElement)

    // Adds an origin-centered grid for visual reference
    if (addGridHelper) {
      // this.add(new THREE.GridHelper(10, 10, 'red'));
      this.add(new THREE.AxesHelper(3))
    }

    // set the background color
    this.background = new THREE.Color(0xefefef);

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
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0xff9900 });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.y = .5;
    this.add(this.cube);

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
      // cameraGroup.add(this.camera, 'fov', 20, 80);
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

  static addCursorMove(cursor: { x: number, y: number }) {
    const canvas = document.getElementById('canvas');
    function onWindowResize(e: MouseEvent) {
      cursor.x = e.clientX / window.innerWidth - .5;
      cursor.y = -(e.clientY / window.innerHeight - .5);
    }
    canvas.addEventListener('mousemove', onWindowResize, false);
  }

  moveCamera() {
    this.camera.position.x = Math.sin(Math.PI * this.cursor.x * 2) * 10;
    this.camera.position.z = Math.cos(Math.PI * this.cursor.x * 2) * 10;
    this.camera.position.y = this.cursor.y * 8
    this.camera.lookAt(this.cube.position)
  }

  rotateCube() {
    this.cube.rotation.y = this.clock.getElapsedTime()
  }
}

const scene = new Scene();

function loop() {
  scene.camera.updateProjectionMatrix();
  // scene.rotateCube();
  scene.moveCamera();
  scene.renderer.render(scene, scene.camera);
  requestAnimationFrame(loop);
}

loop()