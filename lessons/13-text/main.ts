import * as THREE from 'three';
import GUI from 'lil-gui';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { TeapotGeometry } from 'three/examples/jsm/geometries/TeapotGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

class Scene extends THREE.Scene {
  debugger: GUI = null;
  camera: THREE.PerspectiveCamera = null;
  renderer: THREE.WebGLRenderer = null;
  orbitals: OrbitControls = null;
  lights: Array<THREE.Light> = [];
  lightCount: number = 0;
  lightDistance: number = 7;
  width = window.innerWidth;
  height = window.innerHeight;
  textureLoader: THREE.TextureLoader = new THREE.TextureLoader;
  fontLoader: FontLoader = new FontLoader();

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

    // Adds an origin-centered grid for visual reference
    if (addGridHelper) {
      // this.add(new THREE.GridHelper(10, 10, 'red'));
      // this.add(new THREE.AxesHelper(3))
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
      light.position.set(lightX, this.lightDistance / 2, lightZ)
      light.lookAt(0, 0, 0)

      this.add(light);

      this.lights.push(light);
      // Visual helpers to indicate light positions
      this.add(new THREE.PointLightHelper(light, .5, 0xff9900));
    }

    const matcap = this.textureLoader.load('/texture/matcaps/4.png');
    const objectMaterial = new THREE.MeshMatcapMaterial({ matcap })

    this.fontLoader.load(
      '/fonts/helvetiker_regular.typeface.json',
      (font) => {
        const textGeometry = new TextGeometry(
          'Hello World!',
          {
            font,
            size: 0.5,
            height: 0.2,
            curveSegments: 6,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5,
          }
        )
        // get bounding box of text geometry to make it centered
        // textGeometry.computeBoundingBox()
        // console.log(textGeometry.boundingBox)
        // textGeometry.translate(
        //   -(textGeometry.boundingBox.max.x - 0.02) * 0.5,
        //   -(textGeometry.boundingBox.max.y - 0.02) * 0.5,
        //   -(textGeometry.boundingBox.max.z - 0.03) * 0.5,
        // )
        textGeometry.center()

        const text = new THREE.Mesh(textGeometry, objectMaterial)
        this.add(text)
      }
    )

    // Creates the geometry + materials
    const teapotGeometry = new TeapotGeometry(0.2);
    for (let i = 0; i < 100; i++) {
      const teapot = new THREE.Mesh(
        teapotGeometry,
        objectMaterial
      );

      teapot.position.x = (Math.random() - 0.5) * 15;
      teapot.position.y = (Math.random() - 0.5) * 15;
      teapot.position.z = (Math.random() - 0.5) * 15;

      const scale = Math.max(0.9, Math.random() * 1.5)
      teapot.scale.set(scale, scale, scale)

      teapot.rotation.x = Math.random() * Math.PI
      teapot.rotation.y = Math.random() * Math.PI
      teapot.rotation.z = Math.random() * Math.PI

      this.add(teapot);
    }

    // setup Debugger
    if (debug) {
      this.debugger = new GUI();
      const lightGroup = this.debugger.addFolder('Lights');
      for (let i = 0; i < this.lights.length; i++) {
        lightGroup.add(this.lights[i], 'visible');
      }
      lightGroup.close();

      // Add camera to debugger
      const cameraGroup = this.debugger.addFolder('Camera');
      cameraGroup.add(this.camera, 'fov', 20, 80);
      cameraGroup.add(this.camera, 'zoom', 0, 1)
      cameraGroup.close();
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