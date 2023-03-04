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
  lightDistance: number = 7;
  width = window.innerWidth;
  height = window.innerHeight;
  loadingManager: THREE.LoadingManager;
  textureLoader: THREE.TextureLoader;

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
      this.add(new THREE.GridHelper(10, 10, 'red'));
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
      light.position.set(lightX, this.lightDistance / 2, lightZ)
      light.lookAt(0, 0, 0)

      this.add(light);

      this.lights.push(light);
      // Visual helpers to indicate light positions
      this.add(new THREE.PointLightHelper(light, .5, 0xff9900));
    }

    // Create Textures Manually
    // const image = new Image();
    // const texture = new THREE.Texture(image)
    // image.onload = () => { texture.needsUpdate = true };
    // image.src = '/door-texture/basecolor.jpg'

    this.loadingManager = new THREE.LoadingManager()
    this.loadingManager.onProgress = console.log
    this.textureLoader = new THREE.TextureLoader(this.loadingManager)

    const colorTexture = this.textureLoader.load('/texture/door/color.jpg')
    colorTexture.repeat.x = 2
    colorTexture.repeat.y = 3
    colorTexture.wrapS = THREE.MirroredRepeatWrapping
    colorTexture.wrapT = THREE.MirroredRepeatWrapping

    colorTexture.offset.x = 2
    colorTexture.offset.y = 2

    colorTexture.rotation = Math.PI * .5
    colorTexture.center.x = 0.5
    colorTexture.center.y = 0.5

    // Creates the geometry + materials
    const cube1Geometry = new THREE.BoxGeometry(1, 1, 1);
    console.log(cube1Geometry.attributes.uv)
    const cube1Material = new THREE.MeshBasicMaterial({ map: colorTexture });
    const cube1 = new THREE.Mesh(cube1Geometry, cube1Material);
    cube1.position.y = .5;
    cube1.position.x = -1;
    this.add(cube1);


    // filter & mipmapping
    const minecraftTexture = this.textureLoader.load('/texture/checkerboard-8x8.png')
    // make small resolution texture become sharp
    minecraftTexture.magFilter = THREE.LinearFilter

    // minecraftTexture.minFilter = THREE.NearestFilter
    // minecraftTexture.generateMipmaps = false


    const cube2Geometry = new THREE.BoxGeometry(1, 1, 1);
    console.log(cube2Geometry.attributes.uv)
    const cube2Material = new THREE.MeshPhongMaterial({ map: minecraftTexture });
    const cube2 = new THREE.Mesh(cube2Geometry, cube2Material);
    cube2.position.y = .5;
    cube2.position.x = 2;
    this.add(cube2);

    // setup Debugger
    if (debug) {
      this.debugger = new GUI();
      const lightGroup = this.debugger.addFolder('Lights');
      for (let i = 0; i < this.lights.length; i++) {
        lightGroup.add(this.lights[i], 'visible');
      }
      lightGroup.close()

      // Add camera to debugger
      const cameraGroup = this.debugger.addFolder('Camera');
      cameraGroup.add(this.camera, 'fov', 20, 80);
      cameraGroup.add(this.camera, 'zoom', 0, 1)
      cameraGroup.close()

      // texture transform
      const transformGroup = this.debugger.addFolder('Texture transform')
      transformGroup.add(colorTexture, 'rotation', 0, Math.PI * 2, 0.1)
      transformGroup.add(colorTexture.offset, 'x', 1, 5, 0.5).name('Offset X')
      transformGroup.add(colorTexture.offset, 'y', 1, 5, 0.5).name('Offset Y')
      transformGroup.add(colorTexture.center, 'x', 0, 5, 0.5).name('Center X')
      transformGroup.add(colorTexture.center, 'y', 0, 5, 0.5).name('Center Y')
      transformGroup.add(colorTexture.repeat, 'x', 1, 5, 0.5).name('Repeat X')
      transformGroup.add(colorTexture.repeat, 'y', 1, 5, 0.5).name('Repeat Y')
      transformGroup.open()

      // magFilter controller
      const params = {
        linear: true,
        nearest: false,
      }
      const updateParams = (key: keyof typeof params) => {
        for (let i in params) {
          params[i as keyof typeof params] = false
        }
        params[key] = true
        switch (key) {
          case 'linear':
            minecraftTexture.magFilter = THREE.LinearFilter
            minecraftTexture.needsUpdate = true
            break;
          case 'nearest':
            minecraftTexture.magFilter = THREE.NearestFilter
            minecraftTexture.needsUpdate = true
            break;
        }
      }
      const magFilterGroup = this.debugger.addFolder('Mag Filter')
      magFilterGroup.add(params, 'linear').name('Linear Filter').listen().onChange(() => updateParams('linear'))
      magFilterGroup.add(params, 'nearest').name('Nearest Filter').listen().onChange(() => updateParams('nearest'))
      magFilterGroup.open()
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